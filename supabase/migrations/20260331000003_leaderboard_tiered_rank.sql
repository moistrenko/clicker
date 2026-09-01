-- Survivor Rank from tiered kill costs (matches client rankFromKills).
-- Uses SQL + recursive CTE so Supabase SQL editor can run it without splitting on inner semicolons.

drop function if exists public.survivor_rank_from_kills(bigint);
drop function if exists public.survivor_rank_from_kills(double precision);

create or replace function public.survivor_rank_from_kills(kills double precision)
returns bigint
language sql
immutable
as $function$
  with recursive ranks as (
    select 0::bigint as rank, 0::numeric as spent
    union all
    select
      r.rank + 1,
      r.spent + (1000000::numeric * power(8::numeric, r.rank))
    from ranks r
    where r.spent + (1000000::numeric * power(8::numeric, r.rank)) <= greatest(0, kills)::numeric
  )
  select coalesce(max(rank), 0)::bigint from ranks
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
