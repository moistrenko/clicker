-- Order leaderboard by Survivor Rank (same formula as client rankFromKills), then duel wins.

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
