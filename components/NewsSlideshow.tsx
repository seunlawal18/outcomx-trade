"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Zap, TrendingUp, Globe, Star } from "lucide-react";
import { apiGetFeaturedMarkets, ApiMarket } from "@/lib/api";

interface Slide {
  id: number;
  tag: string;
  tagColor: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
  accent: string;
  heroBanner?: string | null; // full-bleed background image from admin
}

// ── Convert a live ApiMarket → Slide ─────────────────────────────
function marketToSlide(m: ApiMarket & {
  heroBanner?: string | null;
  heroTag?: string | null;
  heroSub?: string | null;
  heroAccent?: string | null;
  featuredOrder?: number;
}): Slide {
  const gradients: Record<string, string> = {
    sports:        "linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a0533 100%)",
    crypto:        "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    politics:      "linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)",
    economy:       "linear-gradient(135deg, #0d1f0d 0%, #0a3d1a 50%, #0d1f0d 100%)",
    finance:       "linear-gradient(135deg, #0d1b3e 0%, #0a2a5e 50%, #0d1b3e 100%)",
    entertainment: "linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a0533 100%)",
    esports:       "linear-gradient(135deg, #0f0f2d 0%, #1a1a5e 50%, #0f0f2d 100%)",
  };
  const accents: Record<string, string> = {
    sports: "#6366f1", crypto: "#10b981", politics: "#ef4444",
    economy: "#10b981", finance: "#3b82f6", entertainment: "#f59e0b", esports: "#8b5cf6",
  };
  const tags: Record<string, string> = {
    sports:        "SPORTS",
    crypto:        "CRYPTO",
    politics:      "POLITICS",
    economy:       "ECONOMY",
    finance:       "FINANCE",
    entertainment: "ENTERTAINMENT",
    esports:       "ESPORTS",
  };
  const cat = m.category.toLowerCase();
  const firstOpt = m.options[0];
  const prob = m.probabilities[firstOpt] ?? 50;
  const accent = m.heroAccent || accents[cat] || "#10b981";

  return {
    id: m.id,
    tag: m.heroTag || tags[cat] || "OUTCOMX",
    tagColor: accent,
    headline: m.title,
    sub: m.heroSub || `${firstOpt} is currently at ${prob}% probability.${m.volume > 0 ? ` $${(m.volume / 1000).toFixed(0)}K traded.` : ""}`,
    cta: "Take a Position",
    href: (m as any).heroHref || `/market/${m.id}`,
    gradient: gradients[cat] ?? "linear-gradient(135deg, #0d1b3e 0%, #0a2a5e 50%, #0d1b3e 100%)",
    icon: <TrendingUp size={80} style={{ opacity: 0.1, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />,
    accent,
    heroBanner: (m as any).heroBanner || m.banner || null,
  };
}

// ── Hardcoded fallback slides (shown when no featured markets exist) ──
const FALLBACK_SLIDES: Slide[] = [
  {
    id: 0,
    tag: "AFRICA-FIRST",
    tagColor: "#10b981",
    headline: "Trade What Happens Next.",
    sub: "OutcomX is a prediction market for real-world events. Research, take a position, track market sentiment, and see if your conviction pays off.",
    cta: "Explore Markets",
    href: "/",
    gradient: "linear-gradient(135deg, #0d1b3e 0%, #0a2a5e 50%, #0d1b3e 100%)",
    icon: <span style={{ fontSize: 64, opacity: 0.15, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }}>₿</span>,
    accent: "#3b82f6",
  },
  {
    id: 0,
    tag: "LIVE NOW",
    tagColor: "#10b981",
    headline: "Crypto & Finance Markets",
    sub: "BTC, ETH, and macroeconomic prediction markets. Fast-paced 5-minute to daily durations.",
    cta: "Trade Crypto",
    href: "/?category=crypto",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    icon: <Globe size={80} style={{ opacity: 0.1, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />,
    accent: "#10b981",
  },
  {
    id: 0,
    tag: "TRENDING",
    tagColor: "#6366f1",
    headline: "Sports & Esports Markets",
    sub: "Who wins the match? Take a position on football, basketball, esports results and more.",
    cta: "View Sports",
    href: "/?category=sports",
    gradient: "linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1a0533 100%)",
    icon: <Star size={80} style={{ opacity: 0.1, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />,
    accent: "#6366f1",
  },
  {
    id: 0,
    tag: "POLITICS",
    tagColor: "#ef4444",
    headline: "Political & Economic Markets",
    sub: "Elections, policy decisions, inflation, and geopolitical events — trade the outcomes that shape the world.",
    cta: "Trade Politics",
    href: "/?category=politics",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)",
    icon: <Zap size={80} style={{ opacity: 0.1, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />,
    accent: "#ef4444",
  },
  {
    id: 0,
    tag: "GET STARTED",
    tagColor: "#f59e0b",
    headline: "New to Prediction Markets?",
    sub: "Register free, get a starting balance, and place your first position on a real market in under 2 minutes.",
    cta: "Sign Up Free",
    href: "/register",
    gradient: "linear-gradient(135deg, #0d1f0d 0%, #0a3d1a 50%, #0d1f0d 100%)",
    icon: <TrendingUp size={80} style={{ opacity: 0.1, position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }} />,
    accent: "#10b981",
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function NewsSlideshow() {
  const [slides, setSlides] = useState<Slide[] | null>(null); // null = loading
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch featured markets first — only fall back to static slides if empty/failed
  useEffect(() => {
    apiGetFeaturedMarkets().then(res => {
      if (res.ok && res.data && res.data.length > 0) {
        setSlides(res.data.map(marketToSlide));
      } else {
        setSlides(FALLBACK_SLIDES);
      }
      setCurrent(0);
    }).catch(() => {
      setSlides(FALLBACK_SLIDES);
    });
  }, []);

  // Auto-advance + progress bar
  useEffect(() => {
    if (!visible || paused || !slides) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    setProgress(0);
    const step = 100 / (AUTO_ADVANCE_MS / 50);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setProgress(0);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [visible, paused, current, slides]);

  const goTo = (i: number) => { setCurrent(i); setProgress(0); };
  const prev = () => { if (!slides) return; goTo((current - 1 + slides.length) % slides.length); };
  const next = () => { if (!slides) return; goTo((current + 1) % slides.length); };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;
  if (!slides) return null; // still loading — show nothing, no flash

  const slide = slides[current];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderBottom: "1px solid var(--border)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", zIndex: 10 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: slide.accent,
            transition: "width 0.05s linear",
          }}
        />
      </div>

      {/* Slide */}
      <div
        key={slide.id}
        style={{
          background: slide.heroBanner ? "transparent" : slide.gradient,
          padding: "clamp(12px, 2.5vw, 36px) clamp(14px, 4vw, 56px)",
          minHeight: "clamp(140px, 22vw, 220px)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          animation: "fadeIn 0.4s ease",
        }}
        onClick={() => router.push(slide.href)}
      >
        {/* Full-bleed background image (when heroBanner is set) */}
        {slide.heroBanner && (
          <img
            src={slide.heroBanner}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Gradient overlay — only when there is text content */}
        {(slide.tag || slide.headline || slide.sub) && (
          <div style={{
            position: "absolute", inset: 0,
            background: slide.heroBanner
              ? "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%)"
              : "none",
            pointerEvents: "none",
            zIndex: 1,
          }} />
        )}

        {/* Background icon — only shown when no hero image */}
        {!slide.heroBanner && slide.icon}

        {/* Decorative circles — only shown when no hero image */}
        {!slide.heroBanner && (
          <>
            <div style={{
              position: "absolute", right: -60, top: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: `${slide.accent}15`,
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: 60, bottom: -80,
              width: 160, height: 160, borderRadius: "50%",
              background: `${slide.accent}10`,
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Content — only render if any text field is present */}
        {(slide.tag || slide.headline || slide.sub) && (
          <div style={{ position: "relative", zIndex: 2, maxWidth: 600 }}>
            {/* Tag */}
            {slide.tag && (
              <span style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                color: slide.tagColor,
                marginBottom: 6,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}>
                {slide.tag}
              </span>
            )}

            {/* Headline */}
            {slide.headline && (
              <h2
                className="slideshow-headline"
                style={{
                  fontSize: "clamp(15px, 3vw, 30px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  margin: "0 0 6px",
                  lineHeight: 1.25,
                  letterSpacing: "-0.3px",
                }}
              >
                {slide.headline}
              </h2>
            )}

            {/* Subheadline — hidden on mobile */}
            {slide.sub && (
              <p
                className="slideshow-sub"
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                  margin: "0 0 12px",
                  lineHeight: 1.45,
                  maxWidth: 440,
                }}
              >
                {slide.sub}
              </p>
            )}

            {/* CTA button */}
            <button
              onClick={(e) => { e.stopPropagation(); router.push(slide.href); }}
              style={{
                padding: "9px 22px",
                borderRadius: 24,
                background: slide.accent,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                transition: "opacity 0.2s, transform 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              Take a Position →
            </button>
          </div>
        )}

        {/* CTA-only when no text fields — pure image slide */}
        {!slide.tag && !slide.headline && !slide.sub && (
          <div style={{ position: "relative", zIndex: 2, marginTop: "auto", alignSelf: "flex-end" }}>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(slide.href); }}
              style={{
                padding: "10px 24px",
                borderRadius: 24,
                background: slide.accent,
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              Take a Position →
            </button>
          </div>
        )}

        {/* Nav arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5, transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          style={{
            position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)",
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5, transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        >
          <ChevronRight size={16} />
        </button>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          style={{
            position: "absolute", right: 10, top: 10,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10, transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget.style.background = "rgba(0,0,0,0.5)"); (e.currentTarget.style.color = "#fff"); }}
          onMouseLeave={e => { (e.currentTarget.style.background = "rgba(0,0,0,0.3)"); (e.currentTarget.style.color = "rgba(255,255,255,0.7)"); }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{
        position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 10,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i); }}
            style={{
              width: i === current ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .slideshow-sub { display: none !important; }
          .slideshow-headline { font-size: 15px !important; margin-bottom: 8px !important; }
        }
      `}</style>
    </div>
  );
}
