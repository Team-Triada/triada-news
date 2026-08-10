const CATEGORY_RULES = [
  ["Zero Day", /\bzero-?day\b/i],
  ["Ransomware", /\bransomware\b/i],
  ["Malware", /\bmalware\b|\btrojan\b|\bbackdoor\b|\bspyware\b|\bworm\b/i],
  ["Vulnerability", /\bvulnerabilit(y|ies)\b|\bflaw\b|\bexploit(ed|ation)?\b|\bCVE-\d{4}-\d{4,7}\b/i],
  ["Threat Intel", /\bthreat actor\b|\bAPT\b|\bnation-state\b|\bespionage\b|\bcampaign\b/i],
  ["Incident Response", /\bbreach\b|\bincident\b|\bcompromised?\b|\bhacked\b|\bdata leak\b|\bexposed\b/i],
  ["Cloud", /\bAWS\b|\bAzure\b|\bGoogle Cloud\b|\bGCP\b|\bcloud security\b|\bS3 bucket\b/i],
  ["AI Security", /\bAI\b|\bartificial intelligence\b|\bLLM\b|\bmachine learning\b|\bchatgpt\b|\bgenAI\b/i],
  ["Research", /\bresearch\b|\bproof.of.concept\b|\bPoC\b|\bdeep dive\b/i],
  ["Government", /\bCISA\b|\bNSA\b|\bFBI\b|\bgovernment\b|\bfederal\b|\bsanction/i],
  ["Vendor Advisory", /\badvisory\b|\bpatches\b|\bpatched\b|\bsecurity update\b/i],
  ["Open Source", /\bopen.source\b|\bGitHub\b|\bGitLab\b|\bnpm\b|\bPyPI\b|\bLinux kernel\b|\bApache\b|\bnginx\b/i],
  ["Bug Bounty", /\bbug bounty\b|\bHackerOne\b|\bBugcrowd\b|\bresponsible disclosure\b/i],
];

const VENDOR_ADVISORY_SOURCES = new Set([
  "Microsoft MSRC", "Cisco PSIRT", "Fortinet PSIRT", "CISA Advisories",
  "NCSC UK", "JPCERT/CC", "CERT/CC", "Red Hat Security",
  "Canonical Ubuntu Security", "Debian Security", "SUSE Security", "Atlassian Security",
]);

const TAG_RULES = [
  "Windows", "Linux", "macOS", "Apple", "Android", "Apache", "Nginx",
  "Fortinet", "Cisco", "Palo Alto", "Exchange", "Kerberos", "AWS", "Azure",
  "GCP", "Docker", "Kubernetes", "VMware", "Oracle", "SAP", "WordPress",
  "Chrome", "Firefox", "GitHub", "GitLab", "Ivanti", "Citrix",
];

const CVE_RE = /CVE-\d{4}-\d{4,7}/gi;
const POC_RE = /\bmetasploit\b|\bnuclei\b|\bexploit-?db\b|\bproof.of.concept\b|\bpoc released\b|\bpoc available\b/i;
const ACTIVE_EXPLOIT_RE = /\bactively exploited\b|\bactive exploitation\b|\bexploited in the wild\b/i;
const CRITICAL_HINT_RE = /\bcritical\b|\brce\b|\bremote code execution\b/i;
const RANSOMWARE_HINT_RE = /\bransomware\b/i;

function textOf(item) {
  return `${item.title} ${item.summary}`;
}

export function categorize(item) {
  const text = textOf(item);
  const cats = CATEGORY_RULES.filter(([, re]) => re.test(text)).map(([name]) => name);
  if (VENDOR_ADVISORY_SOURCES.has(item.source) && !cats.includes("Vendor Advisory")) {
    cats.push("Vendor Advisory");
  }
  return cats.length > 0 ? cats : ["News"];
}

export function extractTags(item) {
  const text = textOf(item);
  return TAG_RULES.filter((tag) => new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
}

export function extractCves(item) {
  const matches = textOf(item).match(CVE_RE) || [];
  return Array.from(new Set(matches.map((c) => c.toUpperCase())));
}

export function detectPoc(item) {
  return POC_RE.test(textOf(item));
}

export function detectSeverity(item, { kev, poc }) {
  const text = textOf(item);
  const hasCve = extractCves(item).length > 0;
  const activeExploit = ACTIVE_EXPLOIT_RE.test(text);

  if (kev || activeExploit || (hasCve && CRITICAL_HINT_RE.test(text))) return "critical";
  if (RANSOMWARE_HINT_RE.test(text) || poc || /\bwidespread\b|\bmajor breach\b|\bsignificant\b|\bhigh severity\b/i.test(text)) {
    return "high";
  }
  if (hasCve || /\bpatch\b|\bupdate\b|\bvulnerabilit/i.test(text)) return "medium";
  return "news";
}

function actionFor(severity, categories) {
  if (severity === "critical") return "Patch immediately.";
  if (categories.includes("Ransomware") || categories.includes("Malware")) {
    return "Monitor for indicators of compromise.";
  }
  if (categories.includes("Vendor Advisory") || severity === "medium") {
    return "Review advisory for affected versions and patch on your normal cycle.";
  }
  if (severity === "high") return "Review and assess impact on your environment.";
  return "No action required — informational.";
}

function whyItMattersFor(severity) {
  switch (severity) {
    case "critical":
      return "Actively exploited or high-impact — treat as urgent.";
    case "high":
      return "Significant risk to affected systems; prioritize review.";
    case "medium":
      return "Worth tracking; patch during normal maintenance windows.";
    default:
      return "Background context — no immediate action expected.";
  }
}

export function buildFallbackAiSummary(item, { categories, severity, tags, cves }) {
  return {
    summary: item.summary,
    whyItMatters: whyItMattersFor(severity),
    affected: tags.length > 0 ? tags : ["Not specified"],
    risk: severity.charAt(0).toUpperCase() + severity.slice(1),
    action: actionFor(severity, categories),
    relatedCves: cves,
    source: "heuristic",
  };
}

function aiPrompt(item) {
  return `Analyze this cybersecurity news item and respond with ONLY a JSON object (no markdown, no prose) with keys: summary (2 sentences), whyItMatters (1 sentence), affected (array of affected products/versions, empty array if unclear), risk (one of: Critical, High, Medium, News), action (1 short imperative sentence), relatedCves (array of CVE IDs mentioned, empty array if none).\n\nTitle: ${item.title}\n\nContent: ${item.summary}`;
}

function parseAiJson(text, fallback) {
  try {
    const parsed = JSON.parse(text.trim().replace(/^```json\n?/, "").replace(/```$/, ""));
    return { ...parsed, source: "ai" };
  } catch {
    return fallback;
  }
}

// Flash-Lite free tier: 15 RPM / 500 RPD. Stay under that with fixed spacing.
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_MIN_INTERVAL_MS = 4500;
let geminiQueue = Promise.resolve();

function scheduleGemini(fn) {
  const run = geminiQueue.then(async () => {
    const result = await fn();
    await new Promise((r) => setTimeout(r, GEMINI_MIN_INTERVAL_MS));
    return result;
  });
  geminiQueue = run.catch(() => {});
  return run;
}

async function summarizeWithGemini(gemini, item, fallback) {
  return scheduleGemini(async () => {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: aiPrompt(item),
    });
    const text = res.text;
    if (!text) return fallback;
    return parseAiJson(text, fallback);
  });
}

async function summarizeWithAnthropic(anthropic, item, fallback) {
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: aiPrompt(item) }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block) return fallback;
  return parseAiJson(block.text, fallback);
}

export async function buildAiSummary(aiClient, item, fallback) {
  if (!aiClient) return fallback;
  try {
    if (aiClient.kind === "gemini") return await summarizeWithGemini(aiClient.client, item, fallback);
    if (aiClient.kind === "anthropic") return await summarizeWithAnthropic(aiClient.client, item, fallback);
    return fallback;
  } catch (err) {
    console.error(`ai summary fail (${aiClient.kind}): ${item.link}: ${err.message}`);
    return fallback;
  }
}

export async function fetchKevSet() {
  try {
    const res = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return new Set((data.vulnerabilities || []).map((v) => v.cveID.toUpperCase()));
  } catch (err) {
    console.error(`KEV fetch fail: ${err.message}`);
    return new Set();
  }
}

export async function enrichItem(item, kevSet, aiClient) {
  const categories = categorize(item);
  const tags = extractTags(item);
  const cves = extractCves(item);
  const kev = cves.some((c) => kevSet.has(c));
  const poc = detectPoc(item);
  const severity = detectSeverity(item, { kev, poc });
  const breaking = severity === "critical" && (kev || /\bzero-?day\b/i.test(textOf(item)) || ACTIVE_EXPLOIT_RE.test(textOf(item)));
  const words = textOf(item).split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.min(8, Math.round(words / 40) || 2));

  const fallback = buildFallbackAiSummary(item, { categories, severity, tags, cves });
  const aiSummary = item.aiSummary ?? (await buildAiSummary(aiClient, item, fallback));

  return {
    ...item,
    categories,
    tags,
    cves,
    kev,
    poc,
    severity,
    breaking,
    readTimeMin,
    aiSummary,
  };
}
