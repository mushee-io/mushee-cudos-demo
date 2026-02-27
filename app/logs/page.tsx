"use client";

import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Toast from "../components/Toast";

export default function LogsPage() {
  const [toast, setToast] = useState<{ m: string; k?: "ok" | "bad" | "warn" } | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("mushee_token") || "");
  }, []);

  async function load() {
    setToast(null);
    if (!token) return setToast({ m: "Login first on Home.", k: "warn" });
    try {
      const res = await fetch("/api/logs", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load logs");
      setRows(data.rows || []);
    } catch (e: any) {
      setToast({ m: e?.message || "Error", k: "bad" });
    }
  }

  useEffect(() => { if (token) load(); }, [token]);

  return (
    <div className="wrap">
      <Nav />
      {toast && <Toast message={toast.m} kind={toast.k} />}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="h1">ASI:Cloud Inference Logs</div>
        <div className="muted">
          This is your “proof panel” for the accelerator: provider, model, tokens, latency.
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={load}>Refresh</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Provider</th>
              <th>Model</th>
              <th>Latency</th>
              <th>Tokens (in/out)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.provider}</td>
                <td style={{ maxWidth: 320, wordBreak: "break-word" }}>{r.model}</td>
                <td>{r.latency_ms} ms</td>
                <td>{r.tokens_in} / {r.tokens_out}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="muted">No logs yet. Use AI Chat to generate some.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
