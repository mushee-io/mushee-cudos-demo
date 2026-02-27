import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { randomNonce } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json();
  if (!walletAddress || typeof walletAddress !== "string") {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const nonce = randomNonce(18);

  await sb.from("auth_nonces").upsert({ wallet_address: walletAddress.toLowerCase(), nonce });

  return NextResponse.json({ nonce });
}
