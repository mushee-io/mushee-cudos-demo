-- Run this in Supabase SQL editor

create table if not exists public.users (
  id uuid primary key,
  wallet_address text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.auth_nonces (
  wallet_address text primary key,
  nonce text not null,
  created_at timestamptz default now()
);

create table if not exists public.verifications (
  id uuid primary key,
  user_id uuid references public.users(id) on delete cascade,
  method text not null,
  score float8 not null,
  status text not null, -- pending / verified / failed
  created_at timestamptz default now()
);

create table if not exists public.ai_logs (
  id uuid primary key,
  user_id uuid references public.users(id) on delete cascade,
  provider text not null,
  model text not null,
  tokens_in int not null,
  tokens_out int not null,
  latency_ms int not null,
  created_at timestamptz default now()
);

create table if not exists public.credentials (
  id uuid primary key,
  user_id uuid references public.users(id) on delete cascade,
  type text not null, -- verified_badge
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_ai_logs_user_time on public.ai_logs(user_id, created_at desc);
create index if not exists idx_verifications_user_time on public.verifications(user_id, created_at desc);
