export type Severity = "critical" | "high" | "medium" | "news";

export type AiSummary = {
  summary: string;
  whyItMatters: string;
  affected: string[];
  risk: string;
  action: string;
  relatedCves: string[];
  source: "ai" | "heuristic";
};

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  categories: string[];
  tags: string[];
  cves: string[];
  kev: boolean;
  poc: boolean;
  severity: Severity;
  breaking: boolean;
  readTimeMin: number;
  aiSummary: AiSummary;
};
