"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "../components/Nav";
import Toast from "../components/Toast";

function pickWords() {
  const bank = ["mango","river","planet","yellow","signal","castle","violet","rocket","window","forest","satin","piano","candle","cookie","silver","teapot","jungle","marble","thunder","galaxy"];
  const out: string[] = [];
  while (out.length < 6) {
    const w = bank[Math.floor(Math.random() * bank.length)];
    if (!out.includes(w)) out.push(w);
  }
  return out;
}

export default function VerifyPage() {
  const [toast, setToast] = useState<{ m: string; k?: "ok" | "bad" | "warn" } | null>(null);
  const [token, setToken] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("mushee_token") || "");
    setWords(pickWords());
  }, []);

  const target = useMemo(() => words.join(" "), [words]);

  function begin() {
    setToast(null);
    setResult(null);
    setInput("");
    setWords(pickWords());
    setStart(Date.now());
  }

  async function submit() {
    setToast(null);
    if (!token) return setToast({ m: "Login first on Home.", k: "warn" });
    if (!start) return setToast({ m: "Click Start first.", k: "warn" });

    setWorking(true);
    try {
      const elapsedMs = Date.now() - start;
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ typed: input, target, elapsedMs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Verification failed");
      setResult(data);
      setToast({ m: data.verified ? "Verified Human ✅" : "Not verified yet ❌", k: data.verified ? "ok" : "bad" });
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
          <div className="h1">Verify you’re human</div>
          <div className="muted">
            Demo-friendly, software-first verification: type the phrase quickly and accurately.
            We store only a <b>score + timestamp</b> (no biometrics).
          </div>

          <div className="label">Target phrase</div>
          <div className="code">{target}</div>

          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={begin}>Start</button>
            <span className="pill">{start ? "Timer running…" : "Not started"}</span>
          </div>

          <div className="label">Type it here</div>
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="type the phrase exactly…" />

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={submit} disabled={working}>Submit</button>
            <span className="muted" style={{ fontSize: 12 }}>Tip: this is a placeholder MVP. Swap to selfie/liveness later.</span>
          </div>

          {result && (
            <>
              <div className="label">Result</div>
              <div className="code">
                status: {result.status}{"\n"}
                score: {result.score}{"\n"}
                verified: {String(result.verified)}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="h2">Scoring (simple)</div>
          <ul className="muted">
            <li>Accuracy vs target phrase</li>
            <li>Speed (time taken)</li>
            <li>Retries (future)</li>
          </ul>
          <div className="h2" style={{ marginTop: 14 }}>Unlocks</div>
          <div className="muted">
            If verified, you can use the AI Chat. The backend enforces this.
          </div>
        </div>
      </div>
    </div>
  );
}
