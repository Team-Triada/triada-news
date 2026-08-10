import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { enrichItem, fetchKevSet } from "./lib/enrich.mjs";
import { loadEnvFile } from "./lib/env.mjs";

loadEnvFile();

const FEEDS = [
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
  { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml" },
  { name: "SecurityWeek", url: "https://www.securityweek.com/feed/" },
  { name: "The Record", url: "https://therecord.media/feed/" },
  { name: "Schneier on Security", url: "https://www.schneier.com/feed/atom/" },
  { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed.xml" },
  { name: "Graham Cluley", url: "https://grahamcluley.com/feed/" },
  { name: "Help Net Security", url: "https://www.helpnetsecurity.com/feed/" },
  { name: "Malwarebytes Labs", url: "https://www.malwarebytes.com/blog/feed/index.xml" },
  { name: "WeLiveSecurity", url: "https://www.welivesecurity.com/en/rss/feed/" },
  { name: "Talos Intelligence", url: "https://blog.talosintelligence.com/rss/" },
  { name: "Unit 42", url: "https://unit42.paloaltonetworks.com/feed/" },
  { name: "CyberScoop", url: "https://cyberscoop.com/feed" },
  { name: "Infosecurity Magazine", url: "https://www.infosecurity-magazine.com/rss/news/" },
  { name: "The Register", url: "https://www.theregister.com/security/headlines.atom" },
  { name: "CISA Advisories", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml" },
  { name: "CERT/CC", url: "https://www.kb.cert.org/vuls/atomfeed/" },
  { name: "NCSC UK", url: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml" },
  { name: "JPCERT/CC", url: "https://www.jpcert.or.jp/rss/jpcert.rdf" },
  { name: "Microsoft MSRC", url: "https://api.msrc.microsoft.com/update-guide/rss" },
  { name: "Cisco PSIRT", url: "https://sec.cloudapps.cisco.com/security/center/psirtrss20/CiscoSecurityAdvisory.xml" },
  { name: "Fortinet PSIRT", url: "https://www.fortiguard.com/rss/ir.xml" },
  { name: "Google Project Zero", url: "https://googleprojectzero.blogspot.com/feeds/posts/default" },
  { name: "AWS Security Bulletins", url: "https://aws.amazon.com/security/security-bulletins/rss/feed/" },
  { name: "Azure Updates", url: "https://www.microsoft.com/releasecommunications/api/v2/azure/rss" },
  { name: "GitHub Blog Security", url: "https://github.blog/tag/security/feed/" },
  { name: "Check Point Research", url: "https://research.checkpoint.com/feed/" },
  { name: "Kaspersky Securelist", url: "https://securelist.com/feed/" },
  { name: "Red Hat Security", url: "https://access.redhat.com/blogs/766093/feed" },
  { name: "Canonical Ubuntu Security", url: "https://ubuntu.com/security/notices/rss.xml" },
  { name: "Debian Security", url: "https://www.debian.org/security/dsa-long.rdf" },
  { name: "SUSE Security", url: "https://www.suse.com/c/feed/?tag=security" },
  { name: "ProjectDiscovery", url: "https://blog.projectdiscovery.io/rss/" },
  { name: "watchTowr Labs", url: "https://labs.watchtowr.com/rss/" },
  { name: "Bishop Fox", url: "https://bishopfox.com/blog/rss.xml" },
  { name: "Assetnote", url: "https://blog.assetnote.io/feed.xml" },
  { name: "PortSwigger Research", url: "https://portswigger.net/research/rss" },
  { name: "CrowdStrike", url: "https://www.crowdstrike.com/blog/feed/" },
  { name: "Huntress", url: "https://www.huntress.com/blog/rss.xml" },
  { name: "Rapid7", url: "https://blog.rapid7.com/rss/" },
];

const OUT_PATH = path.join(process.cwd(), "data", "news.json");
const MAX_ITEMS_PER_FEED = 8;
const MAX_TOTAL = 200;
const MAX_GEMINI_CALLS_PER_RUN = 20;

const FEED_TIMEOUT_MS = 15000;
const parser = new Parser({ timeout: FEED_TIMEOUT_MS });

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
const aiClient = process.env.GEMINI_API_KEY
  ? { kind: "gemini", client: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) }
  : process.env.ANTHROPIC_API_KEY
    ? { kind: "anthropic", client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) }
    : null;

async function loadExisting() {
  try {
    const raw = await readFile(OUT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

function summarize(snippet) {
  return snippet.slice(0, 220);
}

async function fetchFeed(feed, existingByLink) {
  let parsed;
  try {
    parsed = await withTimeout(parser.parseURL(feed.url), FEED_TIMEOUT_MS, feed.name);
  } catch (err) {
    console.error(`feed fail: ${feed.name}: ${err.message}`);
    return [];
  }

  const entries = parsed.items.slice(0, MAX_ITEMS_PER_FEED);
  const feedResults = [];
  for (const entry of entries) {
    const link = entry.link ?? "";
    if (!link) continue;

    if (existingByLink.has(link)) {
      feedResults.push(existingByLink.get(link));
      continue;
    }

    const rawSnippet = (entry.contentSnippet || entry.summary || entry.title || "").slice(0, 1500);
    const summary = summarize(rawSnippet);

    feedResults.push({
      title: entry.title ?? "Untitled",
      link,
      source: feed.name,
      publishedAt: entry.isoDate ?? entry.pubDate ?? new Date().toISOString(),
      summary,
    });
  }
  return feedResults;
}

async function run() {
  const t0 = Date.now();
  const existing = await loadExisting();
  const existingByLink = new Map(existing.items.map((i) => [i.link, i]));

  const feedTimings = [];
  const perFeed = await Promise.all(
    FEEDS.map(async (feed) => {
      const start = Date.now();
      const result = await fetchFeed(feed, existingByLink);
      feedTimings.push({ name: feed.name, ms: Date.now() - start });
      return result;
    })
  );
  const results = perFeed.flat();
  const t1 = Date.now();
  console.log(`feed fetch: ${t1 - t0}ms total`);
  feedTimings
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 8)
    .forEach((f) => console.log(`  slowest: ${f.name} — ${f.ms}ms`));

  results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const trimmed = results.slice(0, MAX_TOTAL);

  const kevSet = await fetchKevSet();
  const t2 = Date.now();
  console.log(`KEV fetch: ${t2 - t1}ms`);

  const maxAiCallsPerRun = aiClient?.kind === "gemini" ? MAX_GEMINI_CALLS_PER_RUN : Infinity;
  let aiCallsUsed = 0;
  let cachedCount = 0;
  const enriched = [];
  for (const item of trimmed) {
    const needsAiCall = !item.aiSummary;
    if (!needsAiCall) cachedCount++;
    const clientForItem = needsAiCall && aiCallsUsed < maxAiCallsPerRun ? aiClient : null;
    if (needsAiCall && clientForItem) aiCallsUsed++;
    enriched.push(await enrichItem(item, kevSet, clientForItem));
  }
  const t3 = Date.now();
  console.log(`enrichment: ${t3 - t2}ms (${cachedCount} cached, ${aiCallsUsed} AI calls made)`);

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    JSON.stringify({ updatedAt: new Date().toISOString(), items: enriched }, null, 2)
  );
  console.log(`wrote ${enriched.length} items to ${OUT_PATH} (total: ${Date.now() - t0}ms)`);

  // Timed-out feed fetches leave dangling sockets that keep the event loop
  // alive indefinitely (Promise.race doesn't cancel the losing promise).
  // Force exit once real work is done instead of waiting on stragglers.
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
