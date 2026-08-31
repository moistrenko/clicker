# Supabase multiplayer setup

1. Create a project at https://supabase.com
2. Enable **Anonymous** sign-ins: Authentication → Providers → Anonymous
3. Run [`migrations/20260331000000_multiplayer.sql`](migrations/20260331000000_multiplayer.sql) in the SQL editor
4. Copy Project URL and anon key into `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Without these env vars the game uses a **local mock** backend (bot opponent + in-tab BroadcastChannel matchmaking) so duels and the leaderboard still work offline for development.
