"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, Lock, CheckCircle2 } from "lucide-react";

interface Props {
  label: string;
  accent: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function SwipeToTrade({ label, accent, onConfirm, disabled = false, loading = false }: Props) {
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dragging" | "locking" | "locked">("idle");
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const animFrame = useRef<number | null>(null);

  // Track width minus thumb size minus padding
  const getThreshold = () => (trackRef.current?.offsetWidth ?? 300) - 56 - 8;

  const progress = dragX / Math.max(getThreshold(), 1);

  // Vibrate on lock (mobile haptic)
  const vibrate = (pattern: number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const snapToEnd = useCallback(() => {
    const threshold = getThreshold();
    setDragX(threshold);
    setPhase("locking");
    vibrate([30, 20, 60]); // lock haptic pattern

    setTimeout(() => {
      setPhase("locked");
      onConfirm();
    }, 300);
  }, [onConfirm]);

  const snapBack = useCallback(() => {
    setPhase("idle");
    // Animate back
    const start = Date.now();
    const from = dragX;
    const animate = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / 250, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const newX = from * (1 - ease);
      setDragX(newX);
      if (t < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        setDragX(0);
      }
    };
    animFrame.current = requestAnimationFrame(animate);
  }, [dragX]);

  const handleStart = useCallback((clientX: number) => {
    if (disabled || loading || phase === "locked" || phase === "locking") return;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    startX.current = clientX - dragX;
    setPhase("dragging");
    vibrate([10]); // light haptic on start
  }, [disabled, loading, phase, dragX]);

  const handleMove = useCallback((clientX: number) => {
    if (startX.current === null || phase !== "dragging") return;
    const threshold = getThreshold();
    const newX = Math.max(0, Math.min(clientX - startX.current, threshold));
    setDragX(newX);

    // Micro-haptic at 75% to signal "almost there"
    if (newX / threshold > 0.75 && newX / threshold < 0.8) {
      vibrate([5]);
    }

    if (newX >= threshold) {
      startX.current = null;
      snapToEnd();
    }
  }, [phase, snapToEnd]);

  const handleEnd = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (phase === "dragging") {
      const threshold = getThreshold();
      if (dragX / threshold > 0.6) {
        // Past 60% — snap to end
        snapToEnd();
      } else {
        snapBack();
      }
    }
  }, [phase, dragX, snapToEnd, snapBack]);

  useEffect(() => {
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { e.preventDefault(); handleStart(e.touches[0].clientX); };
  const onTouchMove  = (e: React.TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
  const onTouchEnd   = () => handleEnd();
  const onMouseDown  = (e: React.MouseEvent) => handleStart(e.clientX);
  const onMouseMove  = (e: React.MouseEvent) => { if (startX.current !== null) handleMove(e.clientX); };
  const onMouseUp    = () => handleEnd();

  const isLocked = phase === "locked";
  const isLocking = phase === "locking";
  const isDragging = phase === "dragging";

  const thumbColor = disabled ? "var(--border)" : isLocked ? "#10b981" : accent;
  const trackBg = disabled
    ? "var(--bg-card-hover)"
    : isLocked
    ? "rgba(16,185,129,0.15)"
    : `${accent}18`;

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        width: "100%",
        height: 52,
        borderRadius: 26,
        background: trackBg,
        border: `1.5px solid ${disabled ? "var(--border)" : isLocked ? "rgba(16,185,129,0.4)" : `${accent}40`}`,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={handleEnd}
    >
      {/* Progress fill */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: isLocked ? "100%" : `${4 + dragX + 48}px`,
        background: isLocked
          ? "rgba(16,185,129,0.2)"
          : `${accent}${Math.round(progress * 35 + 10).toString(16).padStart(2, "0")}`,
        borderRadius: 26,
        transition: isDragging ? "none" : "width 0.3s ease, background 0.3s ease",
      }} />

      {/* Label text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        color: isLocked
          ? "#10b981"
          : disabled
          ? "var(--text-muted)"
          : progress > 0.45
          ? "#fff"
          : "var(--text-secondary)",
        pointerEvents: "none",
        paddingLeft: 52,
        paddingRight: 16,
        letterSpacing: "0.3px",
        transition: "color 0.2s, opacity 0.2s",
        opacity: isLocking ? 0 : 1,
      }}>
        {isLocked ? "Trade Locked In ✓" : label}
      </div>

      {/* Lock icon hint at the end */}
      {!isLocked && !disabled && (
        <div style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          opacity: progress > 0.5 ? 1 : 0.2,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}>
          <Lock size={14} color={progress > 0.8 ? accent : "var(--text-muted)"} />
        </div>
      )}

      {/* Thumb */}
      {!isLocked ? (
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            left: 4 + dragX,
            top: 4,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: thumbColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isDragging
              ? `0 4px 20px ${accent}60, 0 2px 8px rgba(0,0,0,0.3)`
              : "0 2px 8px rgba(0,0,0,0.25)",
            transition: isDragging ? "none" : "left 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
            cursor: disabled ? "not-allowed" : "grab",
            zIndex: 2,
            transform: isDragging ? "scale(1.08)" : isLocking ? "scale(1.15)" : "scale(1)",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          {isDragging || phase === "idle"
            ? <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
            : <Lock size={18} color="#fff" />
          }
        </div>
      ) : (
        // Locked state — full green check
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8,
          animation: "lockIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>
          <CheckCircle2 size={22} color="#10b981" />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>
            Trade Locked In
          </span>
        </div>
      )}

      {loading && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 26,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      <style>{`
        @keyframes lockIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
