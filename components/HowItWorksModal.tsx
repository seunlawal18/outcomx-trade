"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";

interface Props {
  onClose: () => void;
  onOpenDeposit?: () => void;
}

const steps = [
  {
    num: 1,
    title: "Pick a Market",
    desc: "Find a real-world question you have a view on. Every market has a clearly defined question, a close date, and a resolution source.",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" }}>
        {/* Mock market card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", width: "100%", maxWidth: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px", lineHeight: 1.4 }}>
            Will Bitcoin exceed $150,000 by Dec 31, 2026?
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "#10b981", fontWeight: 700, margin: "0 0 2px" }}>YES</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#10b981", margin: 0 }}>72%</p>
              <p style={{ fontSize: 10, color: "#10b981", margin: "2px 0 0" }}>0.72¢</p>
            </div>
            <div style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, margin: "0 0 2px" }}>NO</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", margin: 0 }}>28%</p>
              <p style={{ fontSize: 10, color: "#ef4444", margin: "2px 0 0" }}>0.28¢</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
            <span>Vol: $2.4M</span>
            <span>Closes Dec 31</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: 0 }}>
          Odds shift in real time as traders take positions
        </p>
      </div>
    ),
  },
  {
    num: 2,
    title: "Take a Position",
    desc: "Choose YES or NO based on what you think will happen. Commit an amount — you'll see exactly how much you could win before confirming.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "8px 0" }}>
        {/* YES card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", width: 150, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", transform: "rotate(-2deg)" }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>You stake</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 2px" }}>$100</p>
          <p style={{ fontSize: 13, color: "#10b981", fontWeight: 700, margin: "0 0 14px" }}>To Win $400</p>
          <button style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#10b981", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Take YES
          </button>
        </div>
        {/* NO card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", width: 150, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", transform: "rotate(2deg)", opacity: 0.7 }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>You stake</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 2px" }}>$100</p>
          <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, margin: "0 0 14px" }}>To Win $133</p>
          <button style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#ef4444", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Take NO
          </button>
        </div>
      </div>
    ),
  },
  {
    num: 3,
    title: "Track & Resolve",
    desc: "Watch market sentiment shift in real time. When the outcome is known, the market resolves and winning positions pay out automatically.",
    visual: (
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", width: "100%", maxWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
          {/* Confetti dots */}
          {["#10b981","#6366f1","#f59e0b","#3b82f6","#10b981","#ef4444"].map((c, i) => (
            <div key={i} style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: c, top: `${10 + i * 12}%`, left: `${5 + i * 15}%`, opacity: 0.7 }} />
          ))}
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 4px" }}>Your Position</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Will Bitcoin exceed $150K?</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Result</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>YES ✓</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>To Win</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#10b981" }}>$250</span>
          </div>
          <button style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#10b981", border: "none", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Collect Winnings
          </button>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksModal({ onClose, onOpenDeposit }: Props) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { isLoggedIn } = useStore();
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleGetStarted = () => {
    onClose();
    if (isLoggedIn) {
      // User is logged in — open the deposit modal so they can fund and trade
      if (onOpenDeposit) {
        onOpenDeposit();
      } else {
        router.push("/dashboard");
      }
    } else {
      // Not logged in — send to register
      router.push("/register");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          width: "100%", maxWidth: 520,
          background: "#13161e",
          border: "1px solid #2a2d3a",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #2a2d3a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 10px", borderRadius: 20 }}>
              HOW IT WORKS
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Step dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    width: i === step ? 20 : 7,
                    height: 7, borderRadius: 4,
                    background: i === step ? "#10b981" : "#2a2d3a",
                    border: "none", cursor: "pointer", padding: 0,
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: "50%", background: "#1f2333", border: "1px solid #2a2d3a", color: "#8b8fa8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Visual area — dark gradient background */}
        <div style={{
          background: "linear-gradient(135deg, #0d1b3e 0%, #0a2a5e 60%, #0d1b3e 100%)",
          padding: "28px 24px 20px",
          minHeight: 240,
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {current.visual}
        </div>

        {/* Step content */}
        <div style={{ padding: "20px 24px 24px" }}>
          <p style={{ fontSize: 11, color: "#8b8fa8", margin: "0 0 6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Step {current.num} of {steps.length}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#f0f2f5", margin: "0 0 10px", letterSpacing: "-0.3px" }}>
            {current.num}. {current.title}
          </h2>
          <p style={{ fontSize: 14, color: "#8b8fa8", margin: "0 0 20px", lineHeight: 1.65 }}>
            {current.desc}
          </p>

          {/* YES/NO explainer — shown on step 1 */}
          {step === 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#10b981", margin: "0 0 2px", textTransform: "uppercase" }}>YES means</p>
                <p style={{ fontSize: 12, color: "#8b8fa8", margin: 0 }}>You think it will happen</p>
              </div>
              <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", margin: "0 0 2px", textTransform: "uppercase" }}>NO means</p>
                <p style={{ fontSize: 12, color: "#8b8fa8", margin: 0 }}>You think it won't happen</p>
              </div>
            </div>
          )}

          {/* P&L explainer — shown on step 2 */}
          {step === 1 && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#8b8fa8", margin: 0, lineHeight: 1.6 }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>If you're right</span> → you receive your full payout.<br />
                <span style={{ color: "#ef4444", fontWeight: 700 }}>If you're wrong</span> → you lose the amount you staked.
              </p>
            </div>
          )}

          {/* Resolution explainer — shown on step 3 */}
          {step === 2 && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#8b8fa8", margin: 0, lineHeight: 1.6 }}>
                Every market shows its <span style={{ color: "#a5b4fc", fontWeight: 700 }}>resolution source</span> before you take a position — no surprises.
              </p>
            </div>
          )}

          {/* CTA hint on last step */}
          {isLast && (
            <p style={{ fontSize: 12, color: "#4a4d5a", textAlign: "center", margin: "-8px 0 12px" }}>
              {isLoggedIn
                ? "You're signed in — add funds to start taking positions."
                : "Free to join. No deposit needed to browse markets."}
            </p>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: "#1f2333", border: "1px solid #2a2d3a",
                  color: "#8b8fa8", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                ← Back
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: "#10b981", border: "none", color: "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleGetStarted}
                style={{
                  flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 15, fontWeight: 800,
                  background: "#10b981", border: "none", color: "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {isLoggedIn ? "Deposit & Start Trading →" : "Create Free Account →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
