import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SessionRestore from "@/components/SessionRestore";
import RealtimeSync from "@/components/RealtimeSync";
import VerificationBanner from "@/components/VerificationBanner";
import ToastContainer from "@/components/ToastContainer";
import Web3Provider from "@/components/providers/Web3Provider";
import LiveTicker from "@/components/LiveTicker";

export const metadata: Metadata = {
  title: "OUTCOMX — Trade What Happens Next",
  description: "Africa-first prediction markets. Research real-world events, take a position on what you think will happen, and profit when you're right.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  themeColor: "#0d0f14",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body>
        <Web3Provider>
          <ThemeProvider>
            <SessionRestore />
            <RealtimeSync />
            {children}
            <ToastContainer />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
