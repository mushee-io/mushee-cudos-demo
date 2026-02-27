import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyMessage } from "viem";
import { v4 as uuidv4 } from "uuid";
import { signSession } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { walletAddress, message, signature } = await req.json();
  if (![walletAddress, message, signature].every((v) => typeof v === "string" && v.length > 0)) {
    return NextResponse.json({ error: "walletAddress, message, signature required" }, { status: 400 });
  }

  const addr = walletAddress.toLowerCase();
  const sb = supabaseAdmin();

  const { data: nonceRow } = await sb.from("auth_nonces").select("nonce").eq("wallet_address", addr).maybeSingle();
  if (!nonceRow?.nonce) return NextResponse.json({ error: "nonce not found" }, { status: 400 });

  if (!message.includes(`Wallet: ${walletAddress}`) && !message.includes(`Wallet: ${addr}`)) {
    return NextResponse.json({ error: "message wallet mismatch" }, { status: 400 });
  }
  if (!message.includes(`Nonce: ${nonceRow.nonce}`)) {
    return NextResponse.json({ error: "message nonce mismatch" }, { status: 400 });
  }

  const ok = await verifyMessage({ address: walletAddress as `0x${string}`, message, signature: signature as `0x${string}` }).catch(() => false);
  if (!ok) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  // Upsert user
  let userId: string;
  const { data: existing } = await sb.from("users").select("id").eq("wallet_address", addr).maybeSingle();
  if (existing?.id) {
    userId = existing.id;
  } else {
    userId = uuidv4();
    const ins = await sb.from("users").insert({ id: userId, wallet_address: addr });
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  // rotate nonce
  await sb.from("auth_nonces").upsert({ wallet_address: addr, nonce: uuidv4().slice(0, 18) });

  const token = await signSession({ userId, walletAddress: addr! });
  return NextResponse.json({ token, userId });
}
