// Minimal helpers for nonce + basic scoring

export function randomNonce(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
