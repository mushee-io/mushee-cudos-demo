"use client";
import { useEffect, useState } from "react";

export default function Toast({ message, kind }: { message: string; kind?: "ok" | "bad" | "warn" }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  const cls = kind === "ok" ? "ok" : kind === "bad" ? "bad" : "warn";
  return (
    <div className="card" style={{ borderColor: "rgba(35,48,79,.9)", marginTop: 12 }}>
      <div className={cls} style={{ fontWeight: 800 }}>{message}</div>
    </div>
  );
}
