// ── OutcomX brand logo ─────────────────────────────────────────────
// Wordmark: "outcom" in white + gradient X mark (no background)
// Matches the official brand asset.

/** The gradient X mark — no background, transparent */
export function LogoMark({ size = 28 }: { size?: number }) {
  // Unique gradient IDs per size to avoid SVG gradient conflicts
  const uid = `x${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${uid}tl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4fc3f7"/>
          <stop offset="100%" stopColor="#1565c0"/>
        </linearGradient>
        <linearGradient id={`${uid}tr`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5c6bc0"/>
          <stop offset="100%" stopColor="#1a237e"/>
        </linearGradient>
        <linearGradient id={`${uid}bl`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c4dff"/>
          <stop offset="100%" stopColor="#283593"/>
        </linearGradient>
        <linearGradient id={`${uid}br`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#29b6f6"/>
          <stop offset="100%" stopColor="#0d47a1"/>
        </linearGradient>
      </defs>

      {/* X arms — top-left */}
      <polygon
        points="8,4 50,50 40,50 4,8"
        fill={`url(#${uid}tl)`}
        opacity="0.95"
      />
      {/* top-right */}
      <polygon
        points="92,4 60,50 50,50 96,8"
        fill={`url(#${uid}tr)`}
        opacity="0.95"
      />
      {/* bottom-left */}
      <polygon
        points="4,92 50,50 40,50 8,96"
        fill={`url(#${uid}bl)`}
        opacity="0.95"
      />
      {/* bottom-right */}
      <polygon
        points="96,92 60,50 50,50 92,96"
        fill={`url(#${uid}br)`}
        opacity="0.95"
      />

      {/* Centre highlight */}
      <circle cx="50" cy="50" r="7" fill="#90caf9" opacity="0.6"/>
      <circle cx="50" cy="50" r="3" fill="#ffffff" opacity="0.9"/>
    </svg>
  );
}

/** Full wordmark — "outcom" text + X mark, no background */
export default function Logo({
  size = 28,
  textColor,
}: {
  size?: number;
  textColor?: string;
}) {
  const fontSize = Math.round(size * 0.88);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
      <span
        style={{
          fontSize,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: textColor ?? "var(--text-primary)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
        }}
      >
        outcom
      </span>
      <LogoMark size={Math.round(size * 1.1)} />
    </span>
  );
}
