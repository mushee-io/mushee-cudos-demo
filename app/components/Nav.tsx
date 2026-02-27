"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Tab({ href, label }: { href: string; label: string }) {
  const p = usePathname();
  const active = p === href || (href !== "/" && p.startsWith(href));
  return (
    <Link className="tab" href={href} style={active ? { borderColor: "rgba(124,92,255,.85)", color: "var(--text)" } : {}}>
      {label}
    </Link>
  );
}

export default function Nav() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    setWallet(localStorage.getItem("mushee_wallet"));
  }, []);

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("mushee_token") || "";
      if (!token) return setVerified(false);
      const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return setVerified(false);
      const data = await res.json();
      setVerified(Boolean(data?.verified));
    }
    check();
  }, []);

  return (
    <div className="nav">
      <div className="left">
        <div className="logo">M</div>
        <div>
          <div style={{ fontWeight: 900, lineHeight: 1 }}>Mushee</div>
          <div className="muted" style={{ fontSize: 12 }}>Powered by ASI:Cloud</div>
        </div>
        <div className="tabs" style={{ marginLeft: 12 }}>
          <Tab href="/" label="Home" />
          <Tab href="/verify" label="Verify" />
          <Tab href="/chat" label="AI Chat" />
          <Tab href="/logs" label="Logs" />
          <Tab href="/badge" label="Badge" />
        </div>
      </div>
      <div className="row">
        <span className="pill">{verified ? "✅ Verified" : "🔒 Not verified"}</span>
        <span className="pill">{wallet ? `Wallet: ${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "No wallet"}</span>
      </div>
    </div>
  );
}
