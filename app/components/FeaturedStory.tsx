import type { NewsItem } from "@/app/types";
import { SeverityBadge, CategoryBadge, CveBadge, KevBadge } from "./Badges";
import ShareButtons from "./ShareButtons";

export default function FeaturedStory({ item }: { item: NewsItem }) {
  return (
    <div
      className="card-surface p-6 sm:p-8"
      style={{ borderColor: "rgba(255,60,60,0.25)", background: "linear-gradient(180deg, rgba(255,60,60,0.06), var(--card))" }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="pill-tag text-cyan" style={{ borderColor: "var(--triada-cyan)", background: "var(--triada-cyan-dim)" }}>
          FEATURED
        </span>
        <SeverityBadge severity={item.severity} />
        {item.kev && <KevBadge />}
        {item.categories.map((c) => (
          <CategoryBadge key={c} category={c} />
        ))}
      </div>

      <h2
        className="text-2xl font-medium leading-tight text-foreground sm:text-3xl"
        style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}
      >
        {item.title}
      </h2>

      <p className="mt-3 max-w-2xl text-muted-foreground">{item.aiSummary.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.cves.map((cve) => (
          <CveBadge key={cve} cve={cve} />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {item.source} · {item.readTimeMin} min read
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <ShareButtons link={item.link} title={item.title} />
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            Read →
          </a>
        </div>
      </div>
    </div>
  );
}
