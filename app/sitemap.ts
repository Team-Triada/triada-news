import type { MetadataRoute } from "next";
import newsData from "@/data/news.json";
import type { NewsItem } from "@/app/types";

const SITE_URL = "https://news.triada.in";

const { items } = newsData as unknown as { items: NewsItem[]; updatedAt: string | null };

export default function sitemap(): MetadataRoute.Sitemap {
  const cveRoutes = Array.from(new Set(items.flatMap((i) => i.cves))).map((cve) => ({
    url: `${SITE_URL}/cve/${cve}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...cveRoutes,
  ];
}
