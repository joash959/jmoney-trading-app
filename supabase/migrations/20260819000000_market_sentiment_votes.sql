-- Sentiment Poll: one bullish/bearish vote per user per day.
-- Used by src/components/SentimentPoll.tsx.

-- One vote per user per day
create table if not exists public.market_sentiment_votes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  vote_date   date not null default current_date,
  sentiment   text not null check (sentiment in ('bullish', 'bearish')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint market_sentiment_votes_user_date_key unique (user_id, vote_date)
);

alter table public.market_sentiment_votes enable row level security;

-- Users can only see and change their own votes (the upsert needs insert + update)
drop policy if exists "Users read own sentiment votes" on public.market_sentiment_votes;
create policy "Users read own sentiment votes"
  on public.market_sentiment_votes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own sentiment votes" on public.market_sentiment_votes;
create policy "Users insert own sentiment votes"
  on public.market_sentiment_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own sentiment votes" on public.market_sentiment_votes;
create policy "Users update own sentiment votes"
  on public.market_sentiment_votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Totals for a day; returns counts only, never other users' rows
create or replace function public.get_sentiment_counts(p_date date)
returns table (bullish_count integer, bearish_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where sentiment = 'bullish')::int as bullish_count,
    count(*) filter (where sentiment = 'bearish')::int as bearish_count
  from public.market_sentiment_votes
  where vote_date = p_date;
$$;

revoke all on function public.get_sentiment_counts(date) from public;
grant execute on function public.get_sentiment_counts(date) to authenticated;
