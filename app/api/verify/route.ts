import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { clamp } from "@/lib/crypto";

function similarity(a: string, b: string): number {
  // simple token match ratio
  const A = a.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const B = b.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (B.length === 0) return 0;
  let hit = 0;
  for (let i = 0; i < Math.min(A.length, B.length); i++) if (A[i] === B[i]) hit++;
  return hit / B.length;
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { typed, target, elapsedMs } = await req.json();
  if (typeof typed !== "string" || typeof target !== "string" || typeof elapsedMs !== "number") {
    return NextResponse.json({ error: "typed, target, elapsedMs required" }, { status: 400 });
  }

  const acc = similarity(typed, target); // 0..1
  const secs = Math.max(1, elapsedMs / 1000);
  // speed score: 1..0 as secs increases
  const speed = clamp(1 - (secs - 6) / 20, 0, 1);

  // weighted score out of 100
  const score = Math.round((acc * 0.72 + speed * 0.28) * 100);
  const status = score >= 70 ? "verified" : "failed";

  const sb = supabaseAdmin();
  await sb.from("verifications").insert({
    id: uuidv4(),
    user_id: session.userId,
    method: "human_challenge",
    score,
    status,
  });

  return NextResponse.json({ score, status, verified: status === "verified" });
}
