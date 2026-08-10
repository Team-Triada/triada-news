"use client";

import { useState } from "react";

export default function ShareButtons({ link, title }: { link: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
      } catch {
        // user cancelled share, ignore
      }
    } else {
      await copyLink();
    }
  };

  const btnStyle: React.CSSProperties = {
    color: "#7a8190",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    minHeight: 36,
  };

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={copyLink} style={btnStyle} title="Copy link">
        {copied ? "Copied ✓" : "Copy Link"}
      </button>
      <button onClick={share} style={btnStyle} title="Share">
        Share
      </button>
    </div>
  );
}
