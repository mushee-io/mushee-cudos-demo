import { NextRequest } from "next/server";
import { verifySession } from "./jwt";

export async function getSession(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}
