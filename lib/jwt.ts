import { SignJWT, jwtVerify } from "jose";
import { mustEnv } from "./env";

const secret = () => new TextEncoder().encode(mustEnv("APP_JWT_SECRET"));

export type Session = { userId: string; walletAddress: string };

export async function signSession(session: Session) {
  return await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, secret());
  const userId = payload.userId;
  const walletAddress = payload.walletAddress;
  if (typeof userId !== "string" || typeof walletAddress !== "string") {
    throw new Error("Invalid session token");
  }
  return { userId, walletAddress };
}
