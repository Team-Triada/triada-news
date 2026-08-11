import type { NewsItem } from "@/app/types";

export default function BreakingBanner({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-3 rounded-xl px-4 py-3.5 no-underline sm:flex-row sm:items-center sm:justify-between sm:px-5"
      style={{
        background: "linear-gradient(90deg, rgba(255,60,60,0.16), rgba(255,60,60,0.04))",
        border: "1px solid rgba(255,60,60,0.35)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
          style={{ background: "#ff3c3c", color: "#0c0c0e" }}
        >
          BREAKING
        </span>
        <span className="text-sm font-medium text-foreground break-words sm:text-base" style={{ overflowWrap: "anywhere" }}>{item.title}</span>
      </div>
      <span className="text-sm font-medium text-cyan whitespace-nowrap">Read →</span>
    </a>
  );
}

export function BreakingBannerLink({ items }: { items: NewsItem[] }) {
  const worst = items.find((i) => i.breaking);
  if (!worst) return null;
  return <BreakingBanner item={worst} />;
}
