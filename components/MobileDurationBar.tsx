"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/themeStore";
import { MarketDuration } from "@/lib/types";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

const items: { id: MarketDuration | "all"; label: string }[] = [
  { id: "all",     label: "All" },
  { id: "5min",    label: "5 Min" },
  { id: "15min",   label: "15 Min" },
  { id: "1hour",   label: "1 Hour" },
  { id: "4hours",  label: "4 Hours" },
  { id: "daily",   label: "Daily" },
  { id: "weekly",  label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly",  label: "Yearly" },
];

export default function MobileDurationBar() {
  const { markets, activeDuration, setActiveDuration } = useStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);

  const activeLabel = items.find(i => i.id === activeDuration)?.label ?? "All";
  const openCount = markets.filter(m => m.status === "open").length;

  const handleSelect = (id: MarketDuration | "all") => {
    setActiveDuration(id);
    setOpen(false); // auto-close after selection
  };

  const bg = isDark ? "#13161e" : "#ffffff";
  const border = isDark ? "#2a2d3a" : "#e2e8f0";

  return (
    <div className="mobile-duration-wrap" style={{ display: "none" }}>
      {/* Clock pill — sits at the end of category bar row via absolute position */}
      {/* Drawer toggle row */}
      <div
        style={{
          background: bg,
          borderBottom: open ? "none" : `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          height: 36,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Clock size={13} color={activeDuration !== "all" ? "var(--accent)" : "var(--text-muted)"} />
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: activeDuration !== "all" ? "var(--accent)" : "var(--text-secondary)",
          }}>
            {activeDuration !== "all" ? `Duration: ${activeLabel}` : "Filter by Duration"}
          </span>
          {activeDuration !== "all" && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: "var(--accent-bg)", color: "var(--accent)",
              border: "1px solid var(--accent-border)",
              padding: "1px 6px", borderRadius: 10,
            }}>
              {openCount}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp size={14} color="var(--text-muted)" />
          : <ChevronDown size={14} color="var(--text-muted)" />}
      </div>

      {/* Collapsible drawer */}
      {open && (
        <div
          className="fade-in"
          style={{
            background: bg,
            borderBottom: `1px solid ${border}`,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none" as const,
          }}
        >
          <div style={{
            display: "flex", gap: 6,
            padding: "8px 12px 10px",
            minWidth: "max-content",
          }}>
            {items.map(({ id, label }) => {
              const active = activeDuration === id;
              const count = id === "all"
                ? markets.filter(m => m.status === "open").length
                : markets.filter(m => m.duration === id && m.status === "open").length;
              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 20,
                    border: active ? "1px solid var(--accent)" : `1px solid ${border}`,
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : isDark ? "#8b8fa8" : "#64748b",
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.15s", flexShrink: 0,
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: active ? "var(--accent)" : isDark ? "#555870" : "#94a3b8",
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-duration-wrap { display: block !important; }
        }
      `}</style>
    </div>
  );
}
