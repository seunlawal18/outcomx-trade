"use client";
import { useState, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  label: string;        // e.g. "Swipe to Trade YES · $50"
  accent: string;       // button fill color
  onConfirm: () => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 280;
const THUMB_SIZE = 48;
const THRESHOLD = TRACK_WIDTH - THUMB_SIZE - 8; // px to trigger confirm

export default function SwipeToTrade({ label, accent, onConfirm, disabled = false }: Props) {
  const [dragX, setDragX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const startX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = Math.min(dragX / THRESHOLD, 1);

  const handleStart = useCallback((clientX: number) => {
    if (disabled || confirmed) return;
    startX.current = clientX - dragX;
  }, [disabled, confirmed, dragX]);

  const handleMove = useCallback((clientX: number) => {
    if (startX.current === null) return;
    const newX = Math.max(0, Math.min(clientX - startX.current, THRESHOLD));
    setDragX(newX);
    if (newX >= THRESHOLD) {
      startX.current = null;
      setConfirmed(true);
      onConfirm();
    }
  }, [onConfirm]);

  const handleEnd = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (!confirmed) setDragX(0); // snap back
  }, [confirmed]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  // Mouse handlers (for desktop testing)
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => { if (startX.current !== null) handleMove(e.clientX); };
  const onMouseUp = () => handleEnd();

  const reset = () => {
    setDragX(0);
    setConfirmed(false);
  };

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        width: "100%",
        height: THUMB_SIZE + 8,
        borderRadius: THUMB_SIZE,
        background: disabled ? "var(--bg-card-hover)" : `${accent}22`,
        border: `1px solid ${disabled ? "var(--border)" : `${accent}55`}`,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
        cursor: disabled ? "not-allowed" : "grab",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={handleEnd}
    >
      {/* Fill track */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: `${dragX + THUMB_SIZE}px`,
        background: confirmed ? accent : `${accent}${Math.round(progress * 60 + 20).toString(16).padStart(2, "0")}`,
        borderRadius: THUMB_SIZE,
        transition: startX.current ? "none" : "width 0.3s ease",
      }} />

      {/* Label text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        color: disabled ? "var(--text-muted)" : progress > 0.5 ? "#fff" : `${accent}cc`,
        pointerEvents: "none",
        letterSpacing: "0.3px",
        paddingLeft: THUMB_SIZE + 8,
        transition: "color 0.2s",
      }}>
        {confirmed ? "Trade Placed!" : label}
      </div>

      {/* Thumb */}
      {!confirmed && (
        <div
          style={{
            position: "absolute",
            left: 4 + dragX,
            top: 4,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: "50%",
            background: disabled ? "var(--border)" : accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: startX.current ? "none" : "left 0.3s ease",
            cursor: disabled ? "not-allowed" : "grab",
            zIndex: 2,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <ChevronRight size={20} color="#fff" />
        </div>
      )}
    </div>
  );
}
