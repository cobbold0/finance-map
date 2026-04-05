# Finance Map

Finance Map is a Next.js 16 + Supabase personal finance app for tracking wallets, transactions, budgets, goals, reminders, and financial records.

## Stack

- Next.js 16 App Router
- React 19
- Supabase Auth + Postgres + Edge Functions
- Tailwind CSS 4
- React Hook Form + Zod
- Playwright for smoke coverage

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase project URL and anon key.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public anon key.
- `NEXT_PUBLIC_APP_URL`: local app URL used by client features.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: browser push public key.
- `NEXT_PUBLIC_ENABLE_PWA_DEV`: enables PWA behavior in development when set to `true`.
- `NEXT_PUBLIC_ENABLE_MONO`: gates the Mono bank-linking integration. Defaults to `false`.
- `NEXT_PUBLIC_MONO_PUBLIC_KEY`: Mono public key for the hosted connect widget.
- `MONO_SECRET_KEY`: Mono secret key used only by server routes.
- `GEMINI_API_KEY`: AI summary integration key.

## Commands

- `npm run dev` starts the app locally.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.
- `npm run test:e2e` runs the Playwright smoke tests.

## Notes

- The app expects the Supabase migrations in [`/Users/user/vscodeProjects/finance-map/supabase/migrations`](/Users/user/vscodeProjects/finance-map/supabase/migrations) to be applied before testing authenticated flows.
- Public smoke tests target signed-out routes only, so they can run even without a configured Supabase session.
- Mono account linking is implemented in the codebase but hidden behind `NEXT_PUBLIC_ENABLE_MONO=false` by default. This keeps the feature dormant until live business access and keys are available.
- If Mono is enabled later, apply the migration that creates `mono_connected_accounts` before testing the bank-link flow.
