# Mushee (CUDOS / ASI:Cloud) Demo App

Worldcoin-style flow:
**Mushee ID (wallet login) → Human Challenge verification → Unlock Mushee AI chat (powered by ASI:Cloud) → Logs → Badge**

## 1) Requirements
- Node.js 18+
- A Supabase project

## 2) Setup Supabase
1. Create a new Supabase project
2. Open SQL Editor and run: `supabase/schema.sql`
3. Grab:
   - Project URL
   - anon key
   - service role key

## 3) Configure env vars
Copy `.env.example` to `.env.local` and fill in values.

## 4) Install + run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 5) ASI:Cloud config
This app calls an OpenAI-compatible endpoint:
`${ASI_CLOUD_BASE_URL}/v1/chat/completions`

Put your ASI:Cloud key, base URL, and model name into `.env.local`.

## Notes (demo-friendly)
- Verification uses a **software human challenge** (no biometrics stored).
- Auth is wallet-sign + JWT (stored in localStorage for speed).
- For production, move JWT into httpOnly cookies and harden anti-bot checks.
