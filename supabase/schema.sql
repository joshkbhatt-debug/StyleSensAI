-- SQL schema for the documents table. Run this in your Supabase project to
-- create a table that stores each user's saved documents. The table uses
-- Supabase's built‑in UUID extension for primary keys and includes a
-- foreign key reference to the auth.users table.

create extension if not exists "uuid-ossp";

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  content text,
  suggestions jsonb,
  created_at timestamptz not null default now()
);