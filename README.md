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

## Commands

- `npm run dev` starts the app locally.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.
- `npm run test:e2e` runs the Playwright smoke tests.

## Notes

- The app expects the Supabase migrations in [`/Users/user/vscodeProjects/finance-map/supabase/migrations`](/Users/user/vscodeProjects/finance-map/supabase/migrations) to be applied before testing authenticated flows.
- Public smoke tests target signed-out routes only, so they can run even without a configured Supabase session.
