import type { NewsItem } from "@/app/types";

function itemsFromLast24h(items: NewsItem[]) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return items.filter((i) => new Date(i.publishedAt).getTime() >= dayAgo);
}

export default function DailyDigest({ items }: { items: NewsItem[] }) {
  const today = itemsFromLast24h(items);

  const stats = [
    { label: "Critical", value: today.filter((i) => i.severity === "critical").length },
    { label: "New CVEs", value: new Set(today.flatMap((i) => i.cves)).size },
    { label: "Zero Days", value: today.filter((i) => i.categories.includes("Zero Day")).length },
    { label: "Vendor Advisories", value: today.filter((i) => i.categories.includes("Vendor Advisory")).length },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Last 24 hours</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface flex flex-col items-center gap-1 py-4">
            <span className="text-2xl font-medium text-cyan" style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}>
              {s.value}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
