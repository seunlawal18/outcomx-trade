"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, Lock, CheckCircle2 } from "lucide-react";

interface Props {
  label: string;
  accent: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  onReset?: () => void; // called after success so parent can close sheet
}

export default function SwipeToTrade({ label, accent, onConfirm, disabled = false, loading = false, onReset }: Props) {
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dragging" | "locking" | "locked">("idle");
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const animFrame = useRef<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getThreshold = () => (trackRef.current?.offsetWidth ?? 300) - 56 - 8;
  const progress = dragX / Math.max(getThreshold(), 1);

  const vibrate = (pattern: number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  // Reset to idle — called by parent after sheet closes
  const reset = useCallback(() => {
    setDragX(0);
    setPhase("idle");
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const snapToEnd = useCallback(() => {
    const threshold = getThreshold();
    setDragX(threshold);
    setPhase("locking");
    vibrate([30, 20, 60]);

    // Show locked state briefly, then fire onConfirm and auto-reset
    resetTimer.current = setTimeout(() => {
      setPhase("locked");
      onConfirm();
      // Give user 1.2s to see the success, then reset + close
      resetTimer.current = setTimeout(() => {
        reset();
        onReset?.();
      }, 1200);
    }, 300);
  }, [onConfirm, onReset, reset]);

  const snapBack = useCallback(() => {
    setPhase("idle");
    const from = dragX;
    const start = Date.now();
    const animate = () => {
      const t = Math.min((Date.now() - start) / 250, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDragX(from * (1 - ease));
      if (t < 1) animFrame.current = requestAnimationFrame(animate);
      else setDragX(0);
    };
    animFrame.current = requestAnimationFrame(animate);
  }, [dragX]);

  const handleStart = useCallback((clientX: number) => {
    if (disabled || loading || phase === "locked" || phase === "locking") return;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    startX.current = clientX - dragX;
    setPhase("dragging");
    vibrate([10]);
  }, [disabled, loading, phase, dragX]);

  const handleMove = useCallback((clientX: number) => {
    if (startX.current === null || phase !== "dragging") return;
    const threshold = getThreshold();
    const newX = Math.max(0, Math.min(clientX - startX.current, threshold));
    setDragX(newX);
    if (newX / threshold > 0.75 && newX / threshold < 0.82) vibrate([5]);
    if (newX >= threshold) { startX.current = null; snapToEnd(); }
  }, [phase, snapToEnd]);

  const handleEnd = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (phase !== "dragging") return;
    dragX / getThreshold() > 0.6 ? snapToEnd() : snapBack();
  }, [phase, dragX, snapToEnd, snapBack]);

  useEffect(() => () => {
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { e.preventDefault(); handleStart(e.touches[0].clientX); };
  const onTouchMove  = (e: React.TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
  const onTouchEnd   = () => handleEnd();
  const onMouseDown  = (e: React.MouseEvent) => handleStart(e.clientX);
  const onMouseMove  = (e: React.MouseEvent) => { if (startX.current !== null) handleMove(e.clientX); };
  const onMouseUp    = () => handleEnd();

  const isLocked  = phase === "locked";
  const isLocking = phase === "locking";
  const isDragging = phase === "dragging";

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative", width: "100%", height: 52, borderRadius: 26,
        background: isLocked ? "rgba(16,185,129,0.15)" : disabled ? "var(--bg-card-hover)" : `${accent}18`,
        border: `1.5px solid ${isLocked ? "rgba(16,185,129,0.4)" : disabled ? "var(--border)" : `${accent}40`}`,
        overflow: "hidden", userSelect: "none", touchAction: "none",
        transition: "background 0.3s, border-color 0.3s",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={handleEnd}
    >
      {/* Progress fill */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: isLocked ? "100%" : `${4 + dragX + 48}px`,
        background: isLocked ? "rgba(16,185,129,0.2)" : `${accent}${Math.round(progress * 35 + 10).toString(16).padStart(2, "0")}`,
        borderRadius: 26,
        transition: isDragging ? "none" : "width 0.3s ease, background 0.3s ease",
      }} />

      {/* LOCKED STATE — shown alone, no overlap */}
      {isLocked && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8,
          animation: "lockIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
          zIndex: 3,
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>Trade Locked In</span>
        </div>
      )}

      {/* NORMAL STATE — label + thumb */}
      {!isLocked && (
        <>
          {/* Label */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            color: disabled ? "var(--text-muted)" : progress > 0.45 ? "#fff" : "var(--text-secondary)",
            pointerEvents: "none",
            paddingLeft: 52, paddingRight: 20,
            letterSpacing: "0.2px",
            opacity: isLocking ? 0 : 1,
            transition: "opacity 0.2s, color 0.2s",
          }}>
            {label}
          </div>

          {/* Lock hint at right edge */}
          {!disabled && (
            <div style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              opacity: progress > 0.5 ? Math.min((progress - 0.5) * 2, 1) : 0.15,
              transition: "opacity 0.15s", pointerEvents: "none",
            }}>
              <Lock size={13} color={progress > 0.75 ? accent : "var(--text-muted)"} />
            </div>
          )}

          {/* Thumb */}
          <div
            style={{
              position: "absolute", left: 4 + dragX, top: 4,
              width: 44, height: 44, borderRadius: "50%",
              background: disabled ? "var(--border)" : accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isDragging ? `0 4px 20px ${accent}60, 0 2px 8px rgba(0,0,0,0.3)` : "0 2px 8px rgba(0,0,0,0.25)",
              transition: isDragging ? "none" : "left 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, transform 0.15s",
              transform: isDragging ? "scale(1.08)" : isLocking ? "scale(1.2)" : "scale(1)",
              cursor: disabled ? "not-allowed" : "grab",
              zIndex: 2,
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
          >
            {isLocking
              ? <Lock size={18} color="#fff" />
              : <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
            }
          </div>
        </>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 26, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4,
        }}>
          <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      <style>{`
        @keyframes lockIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
