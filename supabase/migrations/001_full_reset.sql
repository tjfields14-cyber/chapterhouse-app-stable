-- Minimal bootstrap for Chapterhouse admin
create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text,
  is_active boolean default true,
  created_at timestamptz default now()
);
