-- Multiplayer: profiles, matchmaking, duels (apply in Supabase SQL editor or via CLI)

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Survivor',
  lifetime_kills double precision not null default 0,
  duel_wins integer not null default 0,
  duel_losses integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.matchmaking_queue (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  status text not null default 'waiting' check (status in ('waiting', 'matched', 'cancelled'))
);

create table if not exists public.duel_matches (
  id uuid primary key default gen_random_uuid(),
  player_a uuid not null references public.profiles (id),
  player_b uuid not null references public.profiles (id),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  score_a double precision not null default 0,
  score_b double precision not null default 0,
  status text not null default 'active'
    check (status in ('active', 'settled', 'cancelled')),
  winner_id uuid references public.profiles (id),
  reward_a double precision not null default 0,
  reward_b double precision not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists duel_matches_players_idx on public.duel_matches (player_a, player_b);
create index if not exists duel_matches_status_idx on public.duel_matches (status);
create index if not exists profiles_lifetime_kills_idx on public.profiles (lifetime_kills desc);

alter table public.profiles enable row level security;
alter table public.matchmaking_queue enable row level security;
alter table public.duel_matches enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Survivor'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles: read all for leaderboard; update own
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Queue: own rows
drop policy if exists "queue_select_own" on public.matchmaking_queue;
create policy "queue_select_own" on public.matchmaking_queue
  for select using (auth.uid() = user_id);

drop policy if exists "queue_insert_own" on public.matchmaking_queue;
create policy "queue_insert_own" on public.matchmaking_queue
  for insert with check (auth.uid() = user_id);

drop policy if exists "queue_delete_own" on public.matchmaking_queue;
create policy "queue_delete_own" on public.matchmaking_queue
  for delete using (auth.uid() = user_id);

drop policy if exists "queue_update_own" on public.matchmaking_queue;
create policy "queue_update_own" on public.matchmaking_queue
  for update using (auth.uid() = user_id);

-- Matches: participants can read; score updates via RPC only
drop policy if exists "matches_select_participants" on public.duel_matches;
create policy "matches_select_participants" on public.duel_matches
  for select using (auth.uid() = player_a or auth.uid() = player_b);

create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.profiles (id)
  values (auth.uid())
  on conflict (id) do nothing;
  select * into row from public.profiles where id = auth.uid();
  return row;
end;
$$;

create or replace function public.sync_lifetime_kills(p_kills double precision)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_profile();
  update public.profiles
  set lifetime_kills = greatest(lifetime_kills, greatest(0, p_kills)),
      updated_at = now()
  where id = auth.uid();
end;
$$;

create or replace function public.join_duel_queue()
returns public.duel_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  opponent uuid;
  match_row public.duel_matches;
  duration interval := interval '5 minutes';
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  perform public.ensure_profile();

  -- Already in an active match?
  select * into match_row
  from public.duel_matches
  where status = 'active'
    and (player_a = me or player_b = me)
  order by started_at desc
  limit 1;
  if found then
    if now() >= match_row.ends_at then
      return public.settle_duel(match_row.id);
    end if;
    return match_row;
  end if;

  -- Try pair with oldest waiter
  select user_id into opponent
  from public.matchmaking_queue
  where status = 'waiting'
    and user_id <> me
  order by joined_at asc
  for update skip locked
  limit 1;

  if opponent is not null then
    delete from public.matchmaking_queue where user_id in (me, opponent);
    insert into public.duel_matches (player_a, player_b, ends_at)
    values (opponent, me, now() + duration)
    returning * into match_row;
    return match_row;
  end if;

  insert into public.matchmaking_queue (user_id, status)
  values (me, 'waiting')
  on conflict (user_id) do update
    set joined_at = now(), status = 'waiting';

  return null;
end;
$$;

create or replace function public.leave_duel_queue()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.matchmaking_queue where user_id = auth.uid();
end;
$$;

create or replace function public.report_duel_score(p_match_id uuid, p_kills double precision)
returns public.duel_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  match_row public.duel_matches;
  elapsed double precision;
  capped double precision;
  max_rate constant double precision := 1e12; -- soft anti-cheat ceiling per second
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  select * into match_row from public.duel_matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found';
  end if;
  if match_row.status <> 'active' then
    return match_row;
  end if;
  if me <> match_row.player_a and me <> match_row.player_b then
    raise exception 'not a participant';
  end if;

  elapsed := greatest(1, extract(epoch from (now() - match_row.started_at)));
  capped := least(greatest(0, p_kills), elapsed * max_rate);

  if me = match_row.player_a then
    update public.duel_matches
    set score_a = greatest(score_a, capped)
    where id = p_match_id
    returning * into match_row;
  else
    update public.duel_matches
    set score_b = greatest(score_b, capped)
    where id = p_match_id
    returning * into match_row;
  end if;

  if now() >= match_row.ends_at then
    return public.settle_duel(p_match_id);
  end if;

  return match_row;
end;
$$;

create or replace function public.settle_duel(p_match_id uuid)
returns public.duel_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  match_row public.duel_matches;
  winner uuid;
  v_reward_a double precision;
  v_reward_b double precision;
begin
  select * into match_row from public.duel_matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found';
  end if;
  if match_row.status = 'settled' then
    return match_row;
  end if;

  if match_row.score_a > match_row.score_b then
    winner := match_row.player_a;
    v_reward_a := match_row.score_a + match_row.score_b;
    v_reward_b := 0;
  elsif match_row.score_b > match_row.score_a then
    winner := match_row.player_b;
    v_reward_a := 0;
    v_reward_b := match_row.score_a + match_row.score_b;
  else
    winner := null;
    v_reward_a := match_row.score_a;
    v_reward_b := match_row.score_b;
  end if;

  update public.duel_matches
  set status = 'settled',
      winner_id = winner,
      reward_a = v_reward_a,
      reward_b = v_reward_b
  where id = p_match_id
  returning * into match_row;

  if winner = match_row.player_a then
    update public.profiles set duel_wins = duel_wins + 1, updated_at = now() where id = match_row.player_a;
    update public.profiles set duel_losses = duel_losses + 1, updated_at = now() where id = match_row.player_b;
  elsif winner = match_row.player_b then
    update public.profiles set duel_wins = duel_wins + 1, updated_at = now() where id = match_row.player_b;
    update public.profiles set duel_losses = duel_losses + 1, updated_at = now() where id = match_row.player_a;
  end if;

  return match_row;
end;
$$;

create or replace function public.get_leaderboard(p_limit integer default 20)
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select *
  from public.profiles
  order by
    case
      when lifetime_kills >= 1000000 then floor(power(lifetime_kills / 1000000.0, 0.5))::bigint
      else 0
    end desc,
    duel_wins desc,
    lifetime_kills desc
  limit greatest(1, least(p_limit, 100));
$$;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant execute on function public.ensure_profile() to authenticated;
grant execute on function public.sync_lifetime_kills(double precision) to authenticated;
grant execute on function public.join_duel_queue() to authenticated;
grant execute on function public.get_active_duel() to authenticated;
grant execute on function public.leave_duel_queue() to authenticated;
grant execute on function public.report_duel_score(uuid, double precision) to authenticated;
grant execute on function public.settle_duel(uuid) to authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
