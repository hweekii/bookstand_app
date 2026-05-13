-- ============================================================
-- THE NEIGHBOURHOOD BOOKSTAND — Supabase Schema
-- Run this entire file in your Supabase SQL editor
-- ============================================================

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  initials text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row after signup (optional helper trigger)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'initials', upper(left(split_part(new.email, '@', 1), 2)))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- BOOKS (logged by users)
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  google_book_id text not null,
  title text not null,
  author text not null,
  cover_url text,
  rating integer check (rating between 1 and 5),
  mood text,
  status text not null default 'finished' check (status in ('finished', 'reading', 'want_to_read', 'abandoned')),
  review text,
  categories text[],
  page_count integer,
  published_year text,
  logged_at timestamptz default now(),
  unique(user_id, google_book_id)
);

alter table public.books enable row level security;

create policy "Anyone can view books"
  on public.books for select using (true);

create policy "Users can insert their own books"
  on public.books for insert with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on public.books for update using (auth.uid() = user_id);

create policy "Users can delete their own books"
  on public.books for delete using (auth.uid() = user_id);


-- FRIENDSHIPS
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(sender_id, receiver_id)
);

alter table public.friendships enable row level security;

create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = sender_id);

create policy "Receiver can update (accept/reject) friendship"
  on public.friendships for update
  using (auth.uid() = receiver_id);

create policy "Either party can delete friendship"
  on public.friendships for delete
  using (auth.uid() = sender_id or auth.uid() = receiver_id);


-- COMMENTS (on bookstands)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Anyone can view comments"
  on public.comments for select using (true);

create policy "Authenticated users can post comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ============================================================
-- ADD USERNAME TO PROFILES
-- Run this if you already ran the initial schema
-- ============================================================
alter table public.profiles add column if not exists username text unique;
create index if not exists profiles_username_idx on public.profiles(username);
