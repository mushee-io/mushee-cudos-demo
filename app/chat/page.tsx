"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Toast from "../components/Toast";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [toast, setToast] = useState<{ m: string; k?: "ok" | "bad" | "warn" } | null>(null);
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Hey — I’m Mushee AI. Verify first, then ask me anything about identity + Web3." }
  ]);
  const [meta, setMeta] = useState<any>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("mushee_token") || "");
  }, []);

  async function send() {
    setToast(null);
    if (!token) return setToast({ m: "Login first on Home.", k: "warn" });
    if (!input.trim()) return;

    const userText = input.trim();
    setMsgs((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setWorking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Chat failed");
      setMsgs((m) => [...m, { role: "assistant", text: data.reply }]);
      setMeta(data.meta);
    } catch (e: any) {
      setToast({ m: e?.message || "Error", k: "bad" });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="wrap">
      <Nav />
      {toast && <Toast message={toast.m} kind={toast.k} />}

      <div className="grid">
        <div className="card">
          <div className="h1">Mushee AI Chat</div>
          <div className="muted">
            Access is gated by verification. Inference is routed through <b>ASI:Cloud</b>.
          </div>

          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div className={m.role === "assistant" ? "ok" : ""} style={{ fontWeight: 800, fontSize: 12 }}>
                  {m.role === "assistant" ? "Mushee AI" : "You"}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Mushee…" />
            <button className="btn primary" onClick={send} disabled={working}>{working ? "Thinking…" : "Send"}</button>
          </div>

          {meta && (
            <>
              <div className="label">Proof of ASI:Cloud usage</div>
              <div className="code">
                provider: {meta.provider}{"\n"}
                model: {meta.model}{"\n"}
                latency_ms: {meta.latency_ms}{"\n"}
                tokens_in: {meta.tokens_in}{"\n"}
                tokens_out: {meta.tokens_out}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="h2">Demo tip</div>
          <div className="muted">
            Ask: “Explain what a proof-of-human credential is, and why it helps stop bots in airdrops.”
          </div>
          <div className="h2" style={{ marginTop: 14 }}>If you get 403</div>
          <div className="muted">
            That’s expected until you pass Verify. This is the “Worldcoin-style unlock”.
          </div>
        </div>
      </div>
    </div>
  );
}
