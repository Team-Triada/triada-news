"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: scrolled ? "rgba(12,12,14,0.92)" : "rgba(12,12,14,0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <nav
        className="flex items-center justify-between gap-3 px-4 sm:px-8"
        style={{ maxWidth: 1240, margin: "0 auto", height: 64 }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0" style={{ textDecoration: "none" }} aria-label="TRIADA home">
          <img
            src="/images/Triada_typo.png"
            alt="TRIADA"
            style={{ height: 16, width: "auto", objectFit: "contain" }}
          />
          <span
            className="hidden sm:inline"
            style={{
              fontFamily: "'Telegraf', var(--font-inter), sans-serif",
              fontSize: 13,
              color: "#7a8190",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              paddingLeft: 12,
            }}
          >
            News
          </span>
        </Link>

        <a
          href="https://triada.in"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0"
          style={{ fontSize: 13, padding: "8px 14px", minHeight: "unset" }}
        >
          triada.in →
        </a>
      </nav>
    </header>
  );
}
