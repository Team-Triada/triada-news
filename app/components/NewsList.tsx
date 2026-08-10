"use client";

import { useMemo, useState } from "react";
import type { NewsItem, Severity } from "@/app/types";
import { SeverityBadge, SeverityDot, CategoryBadge, TagBadge, CveBadge, KevBadge, PocBadge } from "./Badges";
import ShareButtons from "./ShareButtons";
import FeaturedStory from "./FeaturedStory";
import BreakingBanner from "./BreakingBanner";
import DailyDigest from "./DailyDigest";

const PAGE_SIZE = 9;
const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "news"];
const DATE_RANGES = ["All time", "Today", "Yesterday", "This week", "Last week"] as const;
type DateRange = (typeof DATE_RANGES)[number];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function inDateRange(iso: string, range: DateRange) {
  if (range === "All time") return true;
  const now = new Date();
  const d = new Date(iso);
  const startOfDay = (offset: number) => {
    const x = new Date(now);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - offset);
    return x;
  };
  if (range === "Today") return d >= startOfDay(0);
  if (range === "Yesterday") return d >= startOfDay(1) && d < startOfDay(0);
  if (range === "This week") return d >= startOfDay(7);
  if (range === "Last week") return d >= startOfDay(14) && d < startOfDay(7);
  return true;
}

export default function NewsList({ items }: { items: NewsItem[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>("All time");
  const [page, setPage] = useState(1);

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) for (const c of item.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const featured = items[0];
  const rest = items.slice(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((item) => {
      if (source !== "all" && item.source !== source) return false;
      if (category !== "all" && !item.categories.includes(category)) return false;
      if (severity !== "all" && item.severity !== severity) return false;
      if (!inDateRange(item.publishedAt, dateRange)) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.summary,
        item.source,
        ...item.categories,
        ...item.tags,
        ...item.cves,
        item.severity,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rest, query, source, category, severity, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8">
      <DailyDigest items={items} />

      {items.find((i) => i.breaking) && <BreakingBanner item={items.find((i) => i.breaking)!} />}

      {featured && <FeaturedStory item={featured} />}

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setFilter(() => setQuery(e.target.value))}
        placeholder="Search headlines, sources, categories, tags, CVEs…"
        className="form-input"
      />

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid grid-cols-2 gap-2.5 sm:contents">
          <select
            value={source}
            onChange={(e) => setFilter(() => setSource(e.target.value))}
            className="form-select w-full sm:w-auto"
          >
            <option value="all">All sources ({items.length})</option>
            {sources.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setFilter(() => setCategory(e.target.value))}
            className="form-select w-full sm:w-auto"
          >
            <option value="all">All categories</option>
            {categories.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setFilter(() => setDateRange(e.target.value as DateRange))}
          className="form-select w-full sm:w-auto"
        >
          {DATE_RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div
          className="flex items-center gap-1 overflow-x-auto rounded-full p-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setFilter(() => setSeverity("all"))}
            className="shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-medium"
            style={{ color: severity === "all" ? "#fff" : "#7a8190", background: severity === "all" ? "var(--muted)" : "transparent", cursor: "pointer" }}
          >
            All
          </button>
          {SEVERITY_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(() => setSeverity(s))}
              className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium"
              style={{ color: severity === s ? "#fff" : "#7a8190", background: severity === s ? "var(--muted)" : "transparent", cursor: "pointer" }}
            >
              <SeverityDot severity={s} size={6} />
              {s === "news" ? "News" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No headlines match that search.</p>
      ) : (
        <>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "story" : "stories"}
          </p>

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {pageItems.map((item) => (
              <li key={item.link} className="card-surface flex flex-col gap-3 p-5">
                {/* Meta line */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{item.source}</span>
                  <span className="whitespace-nowrap">
                    <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time> · {item.readTimeMin} min
                  </span>
                </div>

                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <SeverityBadge severity={item.severity} />
                  {item.kev && <KevBadge />}
                  {item.poc && <PocBadge />}
                  {item.categories.slice(0, 2).map((c) => (
                    <CategoryBadge key={c} category={c} />
                  ))}
                </div>

                {/* Title + summary */}
                <div className="flex flex-col gap-1.5">
                  <h2
                    className="text-lg font-medium leading-snug text-foreground"
                    style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}
                  >
                    {item.title}
                  </h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.aiSummary.summary}</p>
                </div>

                {item.cves.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.cves.map((cve) => (
                      <CveBadge key={cve} cve={cve} />
                    ))}
                  </div>
                )}

                <details className="group text-sm">
                  <summary className="cursor-pointer select-none text-xs font-medium uppercase tracking-wide text-cyan">
                    Why this matters
                  </summary>
                  <div className="mt-2 flex flex-col gap-1.5 rounded-lg p-3 text-muted-foreground" style={{ background: "var(--muted)" }}>
                    <p>{item.aiSummary.whyItMatters}</p>
                    <p>
                      <span className="text-foreground">Affected:</span> {item.aiSummary.affected.join(", ") || "Not specified"}
                    </p>
                    <p>
                      <span className="text-foreground">Action:</span> {item.aiSummary.action}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                </details>

                {/* Footer actions */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                  <ShareButtons link={item.link} title={item.title} />
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-sm font-medium text-cyan hover:underline">
                    Full article →
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button className="btn-secondary" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>
                ← Prev
              </button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <button className="btn-secondary" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
