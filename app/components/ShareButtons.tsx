"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ link, title }: { link: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

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
    try {
      await navigator.share({ title, url: link });
    } catch {
      // user cancelled share, ignore
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
      {canNativeShare ? (
        <button onClick={share} style={btnStyle} title="Share">
          Share
        </button>
      ) : (
        <button onClick={copyLink} style={btnStyle} title="Copy link">
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
      )}
    </div>
  );
}
