// ── OutcomX brand logo ─────────────────────────────────────────────
// Wordmark: "outcom" in text + gradient X mark matching the icon

/** The X mark as inline SVG — gradient blue/purple with centre glow */
export function LogoMark({ size = 28 }: { size?: number }) {
  const id = `lm${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <defs>
        <radialGradient id={`${id}bg`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0d2040"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>
        <linearGradient id={`${id}lg`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#6B3FD4"/>
          <stop offset="100%" stopColor="#2B6FE0"/>
        </linearGradient>
        <linearGradient id={`${id}rg`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#2B6FE0"/>
          <stop offset="100%" stopColor="#6B3FD4"/>
        </linearGradient>
        <radialGradient id={`${id}cg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="35%" stopColor="#7ac8ff" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#2B6FE0" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${id}ray`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fa8ff" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#000510" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="100" height="100" fill="#000000"/>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}bg)`}/>
      <circle cx="50" cy="50" r="36" fill={`url(#${id}ray)`}/>

      {/* X arms */}
      <polygon points="12,8 50,50 35,50 8,12"  fill={`url(#${id}lg)`} opacity="0.95"/>
      <polygon points="88,8 65,50 50,50 92,12"  fill={`url(#${id}rg)`} opacity="0.95"/>
      <polygon points="8,88 50,50 35,50 12,92"  fill={`url(#${id}lg)`} opacity="0.95"/>
      <polygon points="92,88 65,50 50,50 88,92"  fill={`url(#${id}rg)`} opacity="0.95"/>

      {/* Centre glow */}
      <circle cx="50" cy="50" r="14" fill={`url(#${id}cg)`} opacity="0.9"/>
      <circle cx="50" cy="50" r="2.5" fill="#ffffff"/>
    </svg>
  );
}

/** Full wordmark — "outcom" + gradient X mark */
export default function Logo({
  size = 28,
  textColor,
}: {
  size?: number;
  textColor?: string;
}) {
  const fontSize = Math.round(size * 0.9);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <span
        style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: textColor ?? "var(--text-primary)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        outcom
      </span>
      <LogoMark size={Math.round(size * 1.05)} />
    </span>
  );
}
