# Finance Map

Finance Map is a mobile-first personal finance web app and installable PWA built on Next.js 16 and Supabase. It is structured as a wallet-first financial operating system with modules for wallets, transactions, goals, budgets, reports, reminders, bank details, and settings.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn-style primitives
- Supabase Auth + Postgres + RLS
- React Hook Form + Zod
- Zustand for UI state
- Recharts for reports
- Manifest + custom service worker PWA foundation

## Architecture

The app is organized around clear separation of concerns:

- `src/app`
  App Router entrypoints, route groups, API routes, PWA files, and layouts.
- `src/components`
  Shared UI and app-shell components.
- `src/features`
  Feature modules such as `auth`, `wallets`, `transactions`, `goals`, and `settings`.
- `src/domain`
  Canonical types, finance helpers, and formatting/calculation rules.
- `src/data`
  Auth-aware repository functions that talk to Supabase.
- `src/lib`
  Cross-cutting infrastructure like env loading, Supabase clients, and query client setup.
- `src/stores`
  UI-only client state such as quick actions and prompt visibility.
- `supabase/migrations`
  Database schema and follow-up migrations.
- `scripts`
  SQL helpers and demo seed scripts.

## Current Product Surface

Implemented baseline screens and architecture:

- Welcome, sign-in, sign-up, onboarding
- Authenticated dashboard/home
- Wallet list, create, edit, detail
- Transaction list, create, edit, detail, import entry route
- Goals list, create, edit, detail
- Budgets overview and monthly detail
- Reports dashboard
- Notifications center
- Settings hub, profile/preferences, bank account details, import/export
- JSON export API route
- Install prompt and browser notification permission prompt
- Explicit `public/sw.js` registration with offline shell fallback and notification click handling
- Mobile bottom tab navigation and desktop sidebar shell

## Running Locally

1. Install dependencies:

```bash
pnpm install
```

2. Create local env values:

```bash
cp .env.example .env.local
```

3. Fill in at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start development:

```bash
pnpm dev
```

5. Verify production build:

```bash
pnpm build
pnpm lint
```

## Supabase Notes

The app uses the existing finance schema plus an additional migration for:

- `bank_account_details`
- `exchange_rates`
- `audit_logs`
- `increment_wallet_balance(...)` helper function

Push pending migrations with:

```bash
supabase db push --linked --include-all
```

## Backend Integration Notes

The UI does not call Supabase directly from presentational components. Data access is centralized in `src/data/finance-repository.ts`, so future changes such as:

- live exchange-rate feeds
- recurring transactions
- bank sync
- shared wallets
- native wrappers

can be added without restructuring the screens.

## Important Caveats

- Browser notifications are implemented as local/browser notifications with service-worker delivery, not server push subscriptions yet.
- CSV import has an entry route and architecture slot, but the full preview/mapping workflow is the next implementation step.
- Reports currently use existing transactional data and are ready for richer rollups once more seeded/live data is available.

## PWA And Notifications

- `public/sw.js`
  App-shell caching, navigation fallback to `/offline`, runtime asset caching, and notification click routing.
- `src/lib/pwa.ts`
  Centralized browser notification and service-worker helpers.
- `src/components/providers/pwa-provider.tsx`
  Registers the service worker and keeps browser permission state in sync.
- Development note:
  Service worker registration is production-only by default. Set `NEXT_PUBLIC_ENABLE_PWA_DEV=true` if you want to test registration locally.
