"use client";

import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Toast from "./components/Toast";

async function connectWallet(): Promise<string> {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet found. Install MetaMask (or use a browser wallet).");
  const accounts = await eth.request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("No account returned.");
  return accounts[0];
}

async function signMessage(address: string, message: string): Promise<string> {
  const eth = (window as any).ethereum;
  const sig = await eth.request({ method: "personal_sign", params: [message, address] });
  return sig;
}

export default function Home() {
  const [toast, setToast] = useState<{ m: string; k?: "ok" | "bad" | "warn" } | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "working">("idle");

  useEffect(() => {
    setWallet(localStorage.getItem("mushee_wallet"));
  }, []);

  async function login() {
    setToast(null);
    setStatus("working");
    try {
      const addr = await connectWallet();
      localStorage.setItem("mushee_wallet", addr);
      setWallet(addr);

      // 1) get nonce
      const nRes = await fetch("/api/auth/nonce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress: addr }) });
      if (!nRes.ok) throw new Error(await nRes.text());
      const { nonce } = await nRes.json();

      const msg = `Login to Mushee\nWallet: ${addr}\nNonce: ${nonce}`;
      const signature = await signMessage(addr, msg);

      // 2) verify signature + issue session token
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress: addr, message: msg, signature }) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      localStorage.setItem("mushee_token", data.token);
      setToast({ m: "Mushee ID created. You’re logged in ✅", k: "ok" });
    } catch (e: any) {
      setToast({ m: e?.message || "Login failed", k: "bad" });
    } finally {
      setStatus("idle");
    }
  }

  function logout() {
    localStorage.removeItem("mushee_token");
    setToast({ m: "Logged out.", k: "warn" });
  }

  return (
    <div className="wrap">
      <Nav />
      {toast && <Toast message={toast.m} kind={toast.k} />}

      <div className="grid">
        <div className="card">
          <div className="h1">Mushee ID → Proof-of-Human → Mushee AI</div>
          <div className="muted">
            This demo is built to align with <b>CUDOS / ASI:Cloud</b> by routing AI inference through an OpenAI-compatible
            <b> ASI:Cloud serverless inference endpoint</b>.
          </div>

          <div className="kpi">
            <div className="box">
              <div className="muted">Step 1</div>
              <div className="num">Create Mushee ID</div>
              <div className="muted">Wallet sign-in + session</div>
            </div>
            <div className="box">
              <div className="muted">Step 2</div>
              <div className="num">Verify Human</div>
              <div className="muted">Software challenge (no biometrics)</div>
            </div>
            <div className="box">
              <div className="muted">Step 3</div>
              <div className="num">Unlock AI</div>
              <div className="muted">Inference via ASI:Cloud</div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={login} disabled={status === "working"}>
              {status === "working" ? "Connecting..." : wallet ? "Re-login (refresh token)" : "Create Mushee ID (Connect Wallet)"}
            </button>
            <button className="btn danger" onClick={logout}>Logout</button>
          </div>

          <div className="label">Session</div>
          <div className="code">
            Wallet: {wallet || "(not connected)"}{"\n"}
            Token: {(typeof window !== "undefined" && localStorage.getItem("mushee_token")) ? "stored in localStorage" : "(none)"}
          </div>
        </div>

        <div className="card">
          <div className="h2">What to demo (60 seconds)</div>
          <ol className="muted">
            <li>Connect wallet → Mushee ID</li>
            <li>Verify tab → complete human challenge</li>
            <li>AI Chat tab → ask a question</li>
            <li>Logs tab → show latency + tokens + model</li>
            <li>Badge tab → claim “Verified Human” badge</li>
          </ol>

          <div className="h2" style={{ marginTop: 14 }}>CUDOS alignment</div>
          <div className="muted">
            You can point to the Logs screen to prove decentralized inference usage:
            provider = <b>ASI:Cloud</b>, model, latency, and token usage.
          </div>
        </div>
      </div>
    </div>
  );
}
