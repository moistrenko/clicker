-- Auto-settle expired active duels when resuming or re-entering matchmaking.

create or replace function public.get_active_duel()
returns public.duel_matches
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  match_row public.duel_matches;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  perform public.ensure_profile();

  select * into match_row
  from public.duel_matches
  where status = 'active'
    and (player_a = me or player_b = me)
  order by started_at desc
  limit 1;

  if not found then
    return null;
  end if;

  if now() >= match_row.ends_at then
    return public.settle_duel(match_row.id);
  end if;

  return match_row;
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

grant execute on function public.get_active_duel() to authenticated;
