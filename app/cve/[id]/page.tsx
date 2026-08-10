import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import newsData from "@/data/news.json";
import type { NewsItem } from "@/app/types";
import { SeverityBadge, CategoryBadge, KevBadge, PocBadge } from "@/app/components/Badges";

const { items } = newsData as unknown as { items: NewsItem[]; updatedAt: string | null };

export const revalidate = 3600;

export async function generateStaticParams() {
  const ids = new Set(items.flatMap((i) => i.cves));
  return Array.from(ids).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cveId = id.toUpperCase();
  const related = items.filter((i) => i.cves.includes(cveId));
  if (related.length === 0) return { title: cveId };

  const kev = related.some((i) => i.kev);
  const title = `${cveId}${kev ? " — Known Exploited" : ""}`;
  const description = `${related.length} article${related.length === 1 ? "" : "s"} covering ${cveId}: ${related[0].title}`;

  return {
    title,
    description,
    alternates: { canonical: `/cve/${cveId}` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function CvePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cveId = id.toUpperCase();
  const related = items.filter((i) => i.cves.includes(cveId));

  if (related.length === 0) notFound();

  const kev = related.some((i) => i.kev);
  const poc = related.some((i) => i.poc);
  const worstSeverity = related.reduce((worst, i) => {
    const order = ["critical", "high", "medium", "news"];
    return order.indexOf(i.severity) < order.indexOf(worst) ? i.severity : worst;
  }, related[0].severity);

  return (
    <div className="min-h-screen bg-background dot-grid">
      <main className="mx-auto flex w-full flex-col gap-8 px-8 py-16" style={{ maxWidth: 1240 }}>
        <Link href="/" className="text-sm text-cyan hover:underline w-fit">
          ← Back to News
        </Link>

        <header className="flex flex-col gap-3">
          <h1
            className="text-3xl font-medium tracking-tight text-foreground font-mono"
            style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}
          >
            {cveId}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={worstSeverity} />
            {kev && <KevBadge />}
            {poc && <PocBadge />}
          </div>
          <p className="text-muted-foreground">
            {related.length} {related.length === 1 ? "article mentions" : "articles mention"} this CVE.
          </p>
        </header>

        <ul className="flex flex-col gap-5">
          {related.map((item) => (
            <li key={item.link} className="card-surface p-5">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <SeverityBadge severity={item.severity} />
                {item.categories.map((c) => (
                  <CategoryBadge key={c} category={c} />
                ))}
              </div>
              <h2
                className="text-lg font-medium text-foreground"
                style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}
              >
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.source}</span>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
                  Full article →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
