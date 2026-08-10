import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background dot-grid flex items-center justify-center">
      <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-6 py-20 text-center">
        <span className="pill-tag text-cyan" style={{ borderColor: "var(--triada-cyan)", background: "var(--triada-cyan-dim)" }}>
          404
        </span>

        <h1
          className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "'Telegraf', var(--font-inter), sans-serif" }}
        >
          This route got patched out of existence
        </h1>

        <p className="text-muted-foreground">
          We checked the CISA KEV catalog. We checked our own database. This page
          isn&apos;t exploitable, actively targeted, or real. Consider it responsibly disclosed.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="pill-tag">Severity: Not Found</span>
          <span className="pill-tag">CVSS: N/A</span>
          <span className="pill-tag">Status: 404</span>
        </div>

        <Link href="/" className="btn-primary mt-4" style={{ padding: "10px 22px", fontSize: 14 }}>
          Back to safety →
        </Link>
      </main>
    </div>
  );
}
