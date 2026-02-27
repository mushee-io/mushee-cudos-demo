"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Toast from "../components/Toast";

export default function BadgePage() {
  const [toast, setToast] = useState<{ m: string; k?: "ok" | "bad" | "warn" } | null>(null);
  const [token, setToken] = useState("");
  const [state, setState] = useState<any>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("mushee_token") || "");
  }, []);

  async function load() {
    if (!token) return;
    const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setState(data);
  }
  useEffect(() => { load(); }, [token]);

  async function claim() {
    setToast(null);
    if (!token) return setToast({ m: "Login first on Home.", k: "warn" });
    setWorking(true);
    try {
      const res = await fetch("/api/badge", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setToast({ m: "Badge claimed ✅", k: "ok" });
      await load();
    } catch (e: any) {
      setToast({ m: e?.message || "Error", k: "bad" });
    } finally {
      setWorking(false);
    }
  }

  const profileUrl = state?.profile_url ? `${location.origin}${state.profile_url}` : "";

  return (
    <div className="wrap">
      <Nav />
      {toast && <Toast message={toast.m} kind={toast.k} />}

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="h1">Verified Human Badge</div>
          <div className="muted">
            MVP badge is stored as a credential (DB). You can mint an on-chain SBT later.
          </div>

          <div className="kpi">
            <div className="box">
              <div className="muted">Verification</div>
              <div className="num">{state?.verified ? "✅ Verified" : "🔒 Not verified"}</div>
              <div className="muted">Complete Verify step first</div>
            </div>
            <div className="box">
              <div className="muted">Badge</div>
              <div className="num">{state?.badge ? "✅ Claimed" : "Not claimed"}</div>
              <div className="muted">Claim after verification</div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={claim} disabled={working || !state?.verified || state?.badge}>
              {state?.badge ? "Badge already claimed" : working ? "Claiming…" : "Claim Badge"}
            </button>
          </div>

          {state?.badge && (
            <>
              <div className="label">Shareable profile</div>
              <div className="code">{profileUrl}</div>
            </>
          )}
        </div>

        <div className="card">
          <div className="h2">What reviewers will like</div>
          <ul className="muted">
            <li>Identity gating reduces bot abuse</li>
            <li>AI access is compute-heavy → perfect for decentralized GPU inference</li>
            <li>Logs prove usage (latency/tokens/model)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
