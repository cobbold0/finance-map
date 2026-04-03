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
- Push subscription storage and a scheduled sender Edge Function path

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

4. Generate VAPID keys for push notifications:

```bash
node scripts/generate-vapid-keys.mjs
```

5. Add the public key to `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
```

6. Start development:

```bash
pnpm dev
```

7. Verify production build:

```bash
pnpm build
pnpm lint
```

## Supabase Notes

The app uses the existing finance schema plus an additional migration for:

- `bank_account_details`
- `exchange_rates`
- `audit_logs`
- `push_subscriptions`
- `notification_deliveries`
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

- Browser notifications now support push subscription registration, but scheduled delivery still depends on deploying the Edge Function and setting VAPID secrets.
- CSV import has an entry route and architecture slot, but the full preview/mapping workflow is the next implementation step.
- Reports currently use existing transactional data and are ready for richer rollups once more seeded/live data is available.

## PWA And Notifications

- `public/sw.js`
  App-shell caching, navigation fallback to `/offline`, runtime asset caching, notification click routing, and `push` event handling.
- `src/lib/pwa.ts`
  Centralized browser notification, push subscription, and service-worker helpers.
- `src/components/providers/pwa-provider.tsx`
  Registers the service worker and keeps browser permission state in sync.
- `supabase/functions/send-due-notifications/index.ts`
  Scheduled backend sender for due reminders using Web Push.
- `scripts/generate-vapid-keys.mjs`
  Generates a compatible VAPID public/private key pair for browser push delivery.
- Development note:
  Service worker registration is production-only by default. Set `NEXT_PUBLIC_ENABLE_PWA_DEV=true` if you want to test registration locally.

## Push Delivery Setup

1. Generate VAPID keys:

```bash
node scripts/generate-vapid-keys.mjs
```

2. Put the public key in `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
```

3. Set Edge Function secrets in Supabase:

```bash
supabase secrets set VAPID_PUBLIC_KEY=...
supabase secrets set VAPID_PRIVATE_KEY=...
supabase secrets set VAPID_SUBJECT=mailto:you@example.com
```

4. Deploy the sender function:

```bash
supabase functions deploy send-due-notifications
```

5. Schedule it from Supabase:
- run it every 5-15 minutes
- point the scheduler to `send-due-notifications`
- the function will look for due reminders, skip already-sent deliveries, and send Web Push to saved subscriptions
