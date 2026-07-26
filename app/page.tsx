"use client";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import MarketCard from "@/components/MarketCard";
import Footer from "@/components/Footer";
import DurationSidebar from "@/components/DurationSidebar";
import MobileDurationBar from "@/components/MobileDurationBar";
import NewsSlideshow from "@/components/NewsSlideshow";
import { MarketGridSkeleton } from "@/components/MarketCardSkeleton";
import { parseApiDate } from "@/lib/types";
import { Flame, TrendingUp, Search, ArrowRight, BookOpen, BarChart2, CheckCircle2, Clock } from "lucide-react";

// ── How It Works strip ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: <Search size={20} color="#10b981" />, label: "Discover", desc: "Find a real-world question you have a view on." },
    { icon: <BookOpen size={20} color="#6366f1" />, label: "Research", desc: "Read the market brief, sources, and resolution rules." },
    { icon: <BarChart2 size={20} color="#f59e0b" />, label: "Take a Position", desc: "Pick YES or NO and commit your conviction." },
    { icon: <TrendingUp size={20} color="#3b82f6" />, label: "Track", desc: "Watch market probability shift in real time." },
    { icon: <CheckCircle2 size={20} color="#10b981" />, label: "Resolve & Learn", desc: "Outcome is settled transparently. Profit or learn." },
  ];

  return (
    <section style={{
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      padding: "28px 20px",
      background: "var(--bg-secondary)",
      marginBottom: 0,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 18, textAlign: "center" }}>
          How It Works
        </p>
        <div className="how-it-works-grid">
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                {step.icon}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{step.label}</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight size={14} color="var(--border)" style={{ position: "absolute", right: -10, top: 14, display: "var(--arrow-display, block)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState({ filtered, searchQuery, activeCategory }: { filtered: number; searchQuery: string; activeCategory: string }) {
  if (filtered > 0) return null;
  return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Clock size={28} color="var(--text-muted)" />
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
        {searchQuery ? `No results for "${searchQuery}"` : "No markets yet"}
      </p>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 24px", maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
        {searchQuery
          ? "Try a different search term or browse all categories."
          : activeCategory !== "all"
          ? "No open markets in this category right now. Check back soon."
          : "Markets are being prepared. Come back shortly — new questions drop regularly."}
      </p>
      {activeCategory !== "all" && (
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 8, background: "var(--emerald)", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
          Browse All Markets <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { markets, marketsLoaded, activeCategory, activeDuration, searchQuery, checkExpiredMarkets } = useStore();

  useEffect(() => {
    checkExpiredMarkets();
    const expiredId = setInterval(checkExpiredMarkets, 30_000);
    return () => clearInterval(expiredId);
  }, [checkExpiredMarkets]);

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (m.status !== "open") return false;
      const matchCat = activeCategory === "all"
        ? true
        : activeCategory === "new"
        ? Date.now() - parseApiDate(m.createdAt).getTime() < 48 * 60 * 60 * 1000
        : activeCategory === "closing"
        ? new Date(m.expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000
        : activeCategory === "africa"
        ? ["nigeria","ghana","kenya","southafrica"].some(r => m.title.toLowerCase().includes(r) || m.category === "economy" || m.category === "politics")
        : m.category === activeCategory;
      const matchDur    = activeDuration === "all" || m.duration === activeDuration;
      const matchSearch = !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDur && matchSearch;
    });
  }, [markets, activeCategory, activeDuration, searchQuery]);

  const trending = useMemo(
    () => markets.filter((m) => m.trending && m.status === "open"),
    [markets]
  );

  const showTrending = activeCategory === "all" && activeDuration === "all" && !searchQuery && trending.length > 0;
  const showHowItWorks = activeCategory === "all" && activeDuration === "all" && !searchQuery;

  const sectionLabel = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCategory === "new"     ? "New Markets"
    : activeCategory === "closing" ? "Closing Soon"
    : activeCategory === "africa"  ? "🌍 Africa Markets"
    : activeCategory !== "all"     ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
    : activeDuration !== "all"     ? `${activeDuration.toUpperCase()} Markets`
    : "All Markets";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <CategoryBar />
      <MobileDurationBar />
      <NewsSlideshow />
      {showHowItWorks && <HowItWorks />}

      <div style={{ display: "flex", width: "100%" }}>
        <div className="duration-sidebar-wrap">
          <DurationSidebar />
        </div>

        <main style={{ flex: 1, minWidth: 0, padding: "24px 20px 64px", maxWidth: 1200, margin: "0 auto" }}>

          {/* Trending */}
          {showTrending && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Flame size={17} color="#f59e0b" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Trending</h2>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-card-hover)", border: "1px solid var(--border)", padding: "1px 8px", borderRadius: 20 }}>
                  {trending.length}
                </span>
              </div>
              <div className="markets-grid">
                {trending.slice(0, 4).map((m) => <MarketCard key={m.id} market={m} />)}
              </div>
            </section>
          )}

          {/* Main section */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <TrendingUp size={17} color="var(--emerald)" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{sectionLabel}</h2>
              {marketsLoaded && filtered.length > 0 && (
                <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-card-hover)", border: "1px solid var(--border)", padding: "1px 8px", borderRadius: 20 }}>
                  {filtered.length}
                </span>
              )}
            </div>

            {!marketsLoaded ? (
              <MarketGridSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState filtered={filtered.length} searchQuery={searchQuery} activeCategory={activeCategory} />
            ) : (
              <div className="markets-grid fade-in">
                {filtered.map((m) => <MarketCard key={m.id} market={m} />)}
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />

      <style>{`
        .duration-sidebar-wrap {
          width: 160px;
          flex-shrink: 0;
          position: sticky;
          top: 106px;
          height: calc(100vh - 106px);
          overflow-y: auto;
          align-self: flex-start;
        }
        .how-it-works-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          --arrow-display: block;
        }
        @media (max-width: 900px) {
          .how-it-works-grid {
            grid-template-columns: repeat(3, 1fr);
            --arrow-display: none;
          }
        }
        @media (max-width: 600px) {
          .how-it-works-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .duration-sidebar-wrap { display: none !important; }
          main { padding: 16px 12px 48px !important; }
        }
      `}</style>
    </div>
  );
}
