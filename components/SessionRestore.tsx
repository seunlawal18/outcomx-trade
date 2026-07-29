"use client";
import { useEffect, useRef } from "react";
import { useStore, toTrade, toProfile } from "@/lib/store";
import { apiGetMe, apiGetMyTrades, getToken } from "@/lib/api";

/**
 * Runs once on app load.
 * - Always fetches fresh markets
 * - Restores user session from JWT if token exists and is valid
 *
 * Admin session restore lives in the separate outcomx-admin app now —
 * this app has no admin UI at all.
 */
export default function SessionRestore() {
  const { fetchMarkets } = useStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const restore = async () => {
      // Always fetch fresh markets regardless of auth state
      await fetchMarkets();

      // ── Restore user session ──────────────────────────────────
      const userToken = getToken();
      if (userToken) {
        const meRes = await apiGetMe();
        if (meRes.ok && meRes.data) {
          const user = meRes.data;
          const tradesRes = await apiGetMyTrades();
          const existingCurrency = useStore.getState().userProfile.displayCurrency;
          useStore.setState({
            isLoggedIn: true,
            userEmail:  user.email,
            balance:    user.balance,
            apiOnline:  true,
            trades: tradesRes.ok && tradesRes.data ? tradesRes.data.map(toTrade) : [],
            userProfile: { ...toProfile(user), displayCurrency: existingCurrency ?? "USD" },
          });
        } else {
          // Token invalid/expired — clear session
          useStore.setState({ isLoggedIn: false, userEmail: "", trades: [] });
          localStorage.removeItem("outcomx_token");
        }
      } else {
        // No JWT token — but DON'T clear if already logged in via demo (offline) mode.
        // Demo sessions have no JWT; they persist via zustand/persist in localStorage.
        // Only clear if the persisted state says not logged in anyway.
        const { isLoggedIn, apiOnline } = useStore.getState();
        if (isLoggedIn && !apiOnline) {
          // Demo session — keep it, don't touch it
        } else if (!isLoggedIn) {
          // Already logged out — nothing to do
        } else {
          // Was online session with no token — clear
          useStore.setState({ isLoggedIn: false, userEmail: "", trades: [] });
        }
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
