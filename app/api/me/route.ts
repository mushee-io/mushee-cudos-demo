import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();

  const { data: ver } = await sb
    .from("verifications")
    .select("status,score,created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const verified = ver?.[0]?.status === "verified";

  const { data: cred } = await sb
    .from("credentials")
    .select("id,type,created_at")
    .eq("user_id", session.userId)
    .eq("type", "verified_badge")
    .maybeSingle();

  return NextResponse.json({
    userId: session.userId,
    walletAddress: session.walletAddress,
    verified,
    verification: ver?.[0] || null,
    badge: Boolean(cred),
    profile_url: cred ? `/u/${session.userId}` : null,
  });
}
