import newsData from "@/data/news.json";
import NewsList from "@/app/components/NewsList";
import type { NewsItem } from "@/app/types";

const { items, updatedAt } = newsData as unknown as { items: NewsItem[]; updatedAt: string | null };

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="min-h-screen bg-background dot-grid">
      <main className="mx-auto flex w-full flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-8 sm:py-16" style={{ maxWidth: 1240 }}>
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-medium tracking-tight text-foreground">
            News
          </h1>
          <p className="text-muted-foreground">
            Cybersecurity headlines, summarized. Updated hourly.
            {updatedAt && (
              <span className="ml-2 text-sm text-muted-foreground/70">
                Last update: {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No news yet. Feed fetch runs on schedule.</p>
        ) : (
          <NewsList items={items} />
        )}
      </main>
    </div>
  );
}
