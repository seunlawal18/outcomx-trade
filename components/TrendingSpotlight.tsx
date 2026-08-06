"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import { Market } from "@/lib/types";
import { apiGetTrendingMarkets } from "@/lib/api";
import Countdown from "@/components/Countdown";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import {
  ChevronLeft, ChevronRight, Flame, TrendingUp,
  TrendingDown, Activity, Users,
} from "lucide-react";

// ── Option color helpers ──────────────────────────────────────────
const COLORS = ["#6c63ff", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
function optionColor(opt: string, idx: number) {
  if (opt === "Yes" || opt === "Up")   return "#10b981";
  if (opt === "No"  || opt === "Down") return "#ef4444";
  return COLORS[idx % COLORS.length];
}

// ── Sparkline mini chart ──────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 120, h = 40;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const trending = last >= prev;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(w)}
        cy={h - ((last - min) / range) * (h - 4) - 2}
        r="3.5" fill={color}
      />
    </svg>
  );
}

// ── Generate mock sparkline from probability ──────────────────────
function mockSparkline(prob: number, id: number): number[] {
  const pts: number[] = [];
  let v = prob + (Math.sin(id) * 8);
  for (let i = 0; i < 20; i++) {
    v += (Math.random() - 0.49) * 3;
    v = Math.max(5, Math.min(95, v));
    pts.push(Math.round(v));
  }
  pts[pts.length - 1] = prob;
  return pts;
}

// ── Single spotlight card ─────────────────────────────────────────
function SpotlightCard({ market, onTrade }: { market: Market; onTrade: (opt: string) => void }) {
  const { fmtVol } = useCurrency();
  const { isLoggedIn } = useStore();

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Gradient accent top bar */}
      <div style={{
        height: 3,
        background: "linear-gradient(to right, var(--accent), #10b981)",
      }} />

      <div style={{ padding: "18px 20px 14px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Flame size={12} color="#f59e0b" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                TRENDING
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>
                {market.category}
              </span>
            </div>
            <h3 style={{
              fontSize: "clamp(16px, 2.5vw, 22px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: "-0.3px",
            }}>
              {market.title}
            </h3>
          </div>
          {/* Market image */}
          {market.image && (
            <img src={market.image} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
          )}
        </div>

        {/* Outcomes + sparklines row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {market.options.slice(0, 4).map((opt, i) => {
            const prob = market.probabilities[opt] ?? 0;
            const color = optionColor(opt, i);
            const sparkData = mockSparkline(prob, market.id + i);
            const trend = sparkData[sparkData.length - 1] - sparkData[sparkData.length - 2];

            return (
              <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Option name + prob */}
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opt}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{prob}%</span>
                    {trend !== 0 && (
                      <span style={{ fontSize: 11, color: trend > 0 ? "#10b981" : "#ef4444", display: "flex", alignItems: "center" }}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sparkline */}
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <Sparkline values={sparkData} color={color} />
                </div>

                {/* Trade button */}
                {market.status === "open" && (
                  <button
                    onClick={() => onTrade(opt)}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: `${color}18`,
                      color, border: `1px solid ${color}50`,
                      fontSize: 12, fontWeight: 700,
                      cursor: isLoggedIn ? "pointer" : "pointer",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = color; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}18`; (e.currentTarget as HTMLElement).style.color = color; }}
                  >
                    {(prob / 100).toFixed(2)}¢
                  </button>
                )}
              </div>
            );
          })}

          {/* Probability bar */}
          <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", gap: 1, marginTop: 4 }}>
            {market.options.map((opt, i) => {
              const prob = market.probabilities[opt] ?? 0;
              return (
                <div key={opt} style={{ width: `${prob}%`, height: "100%", background: optionColor(opt, i), transition: "width 0.5s ease" }} />
              );
            })}
          </div>
        </div>

        {/* Footer stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                {fmtVol(market.volume)} Vol.
              </span>
            </div>
            {market.status === "open" && (
              <Countdown expiresAt={market.expiresAt} duration={market.duration} compact />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: 11, color: "var(--emerald)", fontWeight: 700 }}>LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main TrendingSpotlight ────────────────────────────────────────
export default function TrendingSpotlight() {
  const { markets } = useStore();
  const router = useRouter();
  const [trendingMarkets, setTrendingMarkets] = useState<Market[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Try to fetch trending from backend, fall back to store trending markets
  useEffect(() => {
    apiGetTrendingMarkets().then(res => {
      if (res.ok && res.data && res.data.length > 0) {
        // Map ApiMarket to Market (same shape used in store)
        const mapped = res.data.map(m => ({
          id: m.id, title: m.title,
          category: m.category as Market["category"],
          type: m.type as Market["type"],
          options: m.options, status: m.status as Market["status"],
          result: m.result, volume: m.volume,
          createdAt: m.createdAt, probabilities: m.probabilities,
          trending: m.trending, duration: m.duration as Market["duration"],
          expiresAt: m.expiresAt, image: m.image ?? undefined,
          banner: m.banner ?? undefined,
          resolutionSource: m.resolutionSource ?? undefined,
          platformFee: m.platformFee ?? null, prizePool: m.prizePool ?? null,
        } as Market));
        setTrendingMarkets(mapped);
      } else {
        // Fallback — use store markets marked trending
        setTrendingMarkets(
          markets.filter(m => m.trending && m.status === "open")
        );
      }
    }).catch(() => {
      setTrendingMarkets(markets.filter(m => m.trending && m.status === "open"));
    });
  }, [markets]);

  const handleTrade = useCallback((market: Market, option: string) => {
    router.push(`/market/${market.id}?pick=${encodeURIComponent(option)}`);
  }, [router]);

  if (trendingMarkets.length === 0) return null;

  const current = trendingMarkets[currentIdx];
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < trendingMarkets.length - 1;

  return (
    <>
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}

      <section style={{ marginBottom: 28 }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={16} color="#f59e0b" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Trending Markets
            </h2>
            <span style={{
              fontSize: 12, color: "var(--text-secondary)",
              background: "var(--bg-card-hover)", border: "1px solid var(--border)",
              padding: "1px 8px", borderRadius: 20,
            }}>
              {trendingMarkets.length}
            </span>
          </div>

          {/* Carousel nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Dot indicators */}
            <div style={{ display: "flex", gap: 4 }}>
              {trendingMarkets.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  style={{
                    width: i === currentIdx ? 16 : 6, height: 6,
                    borderRadius: 3, border: "none", padding: 0, cursor: "pointer",
                    background: i === currentIdx ? "var(--accent)" : "var(--border)",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={!hasPrev}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--bg-card-hover)", border: "1px solid var(--border)",
                color: hasPrev ? "var(--text-primary)" : "var(--text-muted)",
                cursor: hasPrev ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentIdx(i => Math.min(trendingMarkets.length - 1, i + 1))}
              disabled={!hasNext}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--bg-card-hover)", border: "1px solid var(--border)",
                color: hasNext ? "var(--text-primary)" : "var(--text-muted)",
                cursor: hasNext ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <ChevronRight size={14} />
            </button>

            {/* View market link */}
            <button
              onClick={() => router.push(`/market/${current.id}`)}
              style={{
                fontSize: 12, fontWeight: 600, color: "var(--accent)",
                background: "none", border: "none", cursor: "pointer",
                padding: "0 4px",
              }}
            >
              View →
            </button>
          </div>
        </div>

        {/* Spotlight card */}
        <div className="fade-in" key={current.id}>
          <SpotlightCard
            market={current}
            onTrade={(opt) => handleTrade(current, opt)}
          />
        </div>

        {/* Adjacent markets nav strip */}
        {trendingMarkets.length > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 10, padding: "0 4px",
          }}>
            {hasPrev ? (
              <button
                onClick={() => setCurrentIdx(i => i - 1)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, color: "var(--text-secondary)", background: "none",
                  border: "none", cursor: "pointer", padding: "6px 10px",
                  borderRadius: 8, transition: "all 0.15s",
                  maxWidth: "45%",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <ChevronLeft size={13} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trendingMarkets[currentIdx - 1].title}
                </span>
              </button>
            ) : <div />}

            {hasNext && (
              <button
                onClick={() => setCurrentIdx(i => i + 1)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, color: "var(--text-secondary)", background: "none",
                  border: "none", cursor: "pointer", padding: "6px 10px",
                  borderRadius: 8, transition: "all 0.15s", textAlign: "right",
                  maxWidth: "45%", marginLeft: "auto",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trendingMarkets[currentIdx + 1].title}
                </span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
