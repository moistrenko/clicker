-- Survivor Rank from tiered kill costs (matches client rankFromKills).

drop function if exists public.survivor_rank_from_kills(bigint);
drop function if exists public.survivor_rank_from_kills(double precision);

create or replace function public.survivor_rank_from_kills(kills double precision)
returns bigint
language sql
immutable
as $function$
  select case
    when greatest(0, kills) < 1000000 then 0::bigint
    else floor(
      log((greatest(0, kills) * 4.0 / 1000000.0) + 1.0) / log(5.0)
    )::bigint
  end
$function$;

create or replace function public.get_leaderboard(p_limit integer default 20)
returns setof public.profiles
language sql
security definer
set search_path = public
as $function$
  select *
  from public.profiles
  order by
    public.survivor_rank_from_kills(lifetime_kills) desc,
    duel_wins desc,
    lifetime_kills desc
  limit greatest(1, least(p_limit, 100))
$function$;
