-- Fix ambiguous reward_a / reward_b in settle_duel UPDATE (PL/pgSQL vars vs table columns).

create or replace function public.settle_duel(p_match_id uuid)
returns public.duel_matches
language plpgsql
security definer
set search_path = public
as $function$
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
$function$;
