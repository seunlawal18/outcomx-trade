"use client";
import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/themeStore";

// Abbreviate a market title to a short ticker label
function abbrev(title: string): string {
  // Strip common filler words and trim to ~22 chars
  return title
    .replace(/will\s+/gi, "")
    .replace(/\?/g, "")
    .replace(/by\s+\w+\s+\d{4}/gi, "")
    .trim()
    .slice(0, 26)
    .trim();
}

export default function LiveTicker() {
  const { markets } = useStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  // Pick up to 12 open markets for the ticker
  const tickerItems = useMemo(() => {
    const open = markets.filter(m => m.status === "open").slice(0, 12);
    // If backend offline, use a static set so the ticker is never empty
    if (open.length === 0) return STATIC_ITEMS;
    return open.map(m => {
      const firstOpt = m.options[0];
      const prob = m.probabilities[firstOpt] ?? 50;
      const prev = Math.max(1, Math.min(99, prob + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4)));
      const delta = prob - prev;
      return { id: m.id, label: abbrev(m.title), prob, delta, option: firstOpt };
    });
  }, [markets]);

  // CSS animation — no JS-driven scroll, pure GPU-accelerated CSS
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Duplicate items so the loop is seamless
    const clone = track.cloneNode(true) as HTMLDivElement;
    clone.setAttribute("aria-hidden", "true");
    track.parentElement?.appendChild(clone);
    return () => { clone.remove(); };
  }, [tickerItems]);

  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const bg     = isDark ? "#0d0f14" : "#f8fafc";
  const sep    = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        height: 28,
        background: bg,
        borderBottom: `1px solid ${border}`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 32, background: `linear-gradient(to right, ${bg}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 32, background: `linear-gradient(to left, ${bg}, transparent)`, zIndex: 2, pointerEvents: "none" }} />

      {/* Scrolling track */}
      <div style={{ display: "flex", animation: "ticker-scroll 40s linear infinite", whiteSpace: "nowrap" }}>
        <div ref={trackRef} style={{ display: "flex", alignItems: "center" }}>
          {tickerItems.map((item, i) => {
            const isUp   = item.delta >= 0;
            const color  = item.delta === 0
              ? (isDark ? "#8b8fa8" : "#64748b")
              : isUp ? "#10b981" : "#ef4444";
            const sign   = item.delta > 0 ? "+" : "";

            return (
              <button
                key={i}
                onClick={() => item.id && router.push(`/market/${item.id}`)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "0 14px",
                  borderRight: `1px solid ${sep}`,
                  background: "transparent",
                  border: "none",
                  cursor: item.id ? "pointer" : "default",
                  height: 28,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 11, color: isDark ? "#8b8fa8" : "#64748b", fontWeight: 500, letterSpacing: "0.1px" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
                  {item.prob}¢
                </span>
                {item.delta !== 0 && (
                  <span style={{ fontSize: 10, color, fontWeight: 600 }}>
                    {sign}{item.delta}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// Static fallback when no markets are loaded yet
const STATIC_ITEMS = [
  { id: null, label: "BTC >$150K by Dec 2026",      prob: 72, delta:  2,  option: "Yes" },
  { id: null, label: "Fed Cuts Sep 2026",            prob: 44, delta: -1,  option: "Yes" },
  { id: null, label: "Naira <₦1600 to USD",          prob: 29, delta:  1,  option: "Yes" },
  { id: null, label: "ETH >$5K",                     prob: 38, delta:  3,  option: "Yes" },
  { id: null, label: "Ghana World Cup 2026",         prob: 62, delta:  1,  option: "Yes" },
  { id: null, label: "S&P 500 >5800",                prob: 53, delta: -1,  option: "Yes" },
  { id: null, label: "AAPL >$250",                   prob: 71, delta: -2,  option: "Yes" },
  { id: null, label: "AFCON Nigeria Win",            prob: 34, delta:  0,  option: "Yes" },
  { id: null, label: "Arsenal Top 4",                prob: 88, delta:  1,  option: "Yes" },
  { id: null, label: "Nigeria inflation <20% Dec",   prob: 41, delta: -1,  option: "Yes" },
  { id: null, label: "T1 win Worlds 2026",           prob: 62, delta:  2,  option: "Yes" },
  { id: null, label: "Democrats sweep Midterms",     prob: 50, delta:  0,  option: "Yes" },
];
