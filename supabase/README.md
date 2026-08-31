# Supabase multiplayer setup

1. Create a project at https://supabase.com
2. Enable **Anonymous** sign-ins: Authentication → Providers → Anonymous
3. Run [`migrations/20260331000000_multiplayer.sql`](migrations/20260331000000_multiplayer.sql) in the SQL editor
4. Copy Project URL and anon key into `.env.local` (local only; gitignored):

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. For **GitHub Pages**, add the same two values as repository secrets:
   - Repo → Settings → Secrets and variables → Actions
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   CI injects them at build time (see `.github/workflows/ci.yml`).

6. Allow the Pages origin in Supabase Auth:
   - Authentication → URL Configuration
   - Site URL: `https://moistrenko.github.io/clicker/`
   - Redirect URLs: add `https://moistrenko.github.io/clicker/**`

Without these env vars the game uses a **local mock** backend (bot opponent) so duels still work offline for development.
