"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const SLOT = {
  left: { slot: "8840258400", width: 160, height: 600 },
  right: { slot: "6795609649", width: 120, height: 728 },
} as const;

export default function AdRail({ side }: { side: "left" | "right" }) {
  const pushed = useRef(false);
  const { slot, width, height } = SLOT[side];

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle script not ready yet, ignore
    }
  }, []);

  return (
    <div
      className="hidden 2xl:block fixed top-32 z-10"
      style={{ [side]: 24, width } as React.CSSProperties}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width, height }}
        data-ad-client="ca-pub-2599448168896086"
        data-ad-slot={slot}
      />
    </div>
  );
}
