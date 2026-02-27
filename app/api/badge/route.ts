import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();

  const { data: ver } = await sb
    .from("verifications")
    .select("status")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (ver?.[0]?.status !== "verified") {
    return NextResponse.json({ error: "You must be verified first" }, { status: 403 });
  }

  const { data: existing } = await sb
    .from("credentials")
    .select("id")
    .eq("user_id", session.userId)
    .eq("type", "verified_badge")
    .maybeSingle();

  if (existing?.id) return NextResponse.json({ ok: true, already: true });

  const ins = await sb.from("credentials").insert({
    id: uuidv4(),
    user_id: session.userId,
    type: "verified_badge",
  });

  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
