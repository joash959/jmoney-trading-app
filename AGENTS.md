# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Backend (Supabase)

- This app and the Trade with J Money website (`joash959/jmoney-master-app`) share one Supabase project: **Jmoney Trading Academy**, ref `kkayisukkckaqqxwouga` (configured in `src/lib/supabase.ts`).
- The old Lovable-managed project (`tfyeidideacnwmqjflos`) is retired. Never point the app back at it.
- Database changes (tables, RLS policies, RPCs) go in the website repo's `supabase/migrations/`, not this repo, so the shared schema has one source of truth. Write migrations to be safe to re-run.
- Edge functions also live in the website repo. Before relying on a table, RPC or edge function from the app, check it exists in the live project.
