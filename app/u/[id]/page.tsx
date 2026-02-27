import Nav from "../../components/Nav";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function Profile({ params }: { params: { id: string } }) {
  const sb = supabaseAdmin();

  const { data: user } = await sb.from("users").select("id,wallet_address,created_at").eq("id", params.id).maybeSingle();
  const { data: ver } = await sb.from("verifications").select("status,score,created_at").eq("user_id", params.id).order("created_at", { ascending: false }).limit(1);
  const { data: badge } = await sb.from("credentials").select("type,created_at").eq("user_id", params.id).eq("type","verified_badge").maybeSingle();

  const v = ver?.[0];

  return (
    <div className="wrap">
      <Nav />
      <div className="card" style={{ marginTop: 16 }}>
        <div className="h1">Mushee Profile</div>
        <div className="muted">Public, shareable demo profile (no sensitive data).</div>

        <div className="kpi">
          <div className="box">
            <div className="muted">User ID</div>
            <div className="num" style={{ fontSize: 16 }}>{user?.id || "Unknown"}</div>
            <div className="muted">{user?.wallet_address ? `Wallet: ${user.wallet_address.slice(0,6)}…${user.wallet_address.slice(-4)}` : ""}</div>
          </div>
          <div className="box">
            <div className="muted">Verification</div>
            <div className="num">{v?.status === "verified" ? "✅ Verified" : "🔒 Not verified"}</div>
            <div className="muted">Score: {v?.score ?? "—"}</div>
          </div>
          <div className="box">
            <div className="muted">Badge</div>
            <div className="num">{badge ? "✅ Claimed" : "—"}</div>
            <div className="muted">{badge?.created_at ? new Date(badge.created_at).toLocaleString() : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
