import Link from "next/link";
import type { Severity } from "@/app/types";

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ff5c5c", bg: "rgba(255,60,60,0.12)" },
  high: { label: "High", color: "#ff9f45", bg: "rgba(255,159,69,0.12)" },
  medium: { label: "Medium", color: "#e8c547", bg: "rgba(232,197,71,0.12)" },
  news: { label: "News", color: "#9aa1ac", bg: "rgba(154,161,172,0.1)" },
};

export function SeverityDot({ severity, size = 7 }: { severity: Severity; size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: SEVERITY_META[severity].color,
        flexShrink: 0,
      }}
    />
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}33` }}
    >
      <SeverityDot severity={severity} />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ color: "#c8cdd5", background: "var(--muted)", border: "1px solid var(--border)" }}
    >
      {category}
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{ color: "#7a8190", background: "transparent", border: "1px solid var(--border)" }}
    >
      {tag}
    </span>
  );
}

export function CveBadge({ cve }: { cve: string }) {
  return (
    <Link
      href={`/cve/${cve}`}
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-mono font-medium hover:underline"
      style={{ color: "#ff9090", background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)" }}
    >
      {cve}
    </Link>
  );
}

export function KevBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: "#0c0c0e", background: "#ff3c3c" }}
    >
      Known Exploited
    </span>
  );
}

export function PocBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ color: "#c8cdd5", background: "var(--muted)", border: "1px solid var(--border)" }}
    >
      PoC Released
    </span>
  );
}
