import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { asiChat } from "@/lib/asi";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: ver } = await sb
    .from("verifications")
    .select("status")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (ver?.[0]?.status !== "verified") {
    return NextResponse.json({ error: "Verify to unlock Mushee AI" }, { status: 403 });
  }

  const t0 = Date.now();
  try {
    const out = await asiChat(message.trim());
    const latency = Date.now() - t0;

    await sb.from("ai_logs").insert({
      id: uuidv4(),
      user_id: session.userId,
      provider: "asi_cloud",
      model: out.model,
      tokens_in: out.promptTokens,
      tokens_out: out.completionTokens,
      latency_ms: latency,
    });

    return NextResponse.json({
      reply: out.text,
      meta: {
        provider: "ASI:Cloud",
        model: out.model,
        latency_ms: latency,
        tokens_in: out.promptTokens,
        tokens_out: out.completionTokens,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "ASI:Cloud request failed" }, { status: 502 });
  }
}
