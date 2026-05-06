# Architecture & Repo Conventions

This document is the authoritative source for layout and layering rules in the Next Store repo. When other docs (notably `PLAN.md`) show example file paths that conflict with these rules, follow these rules.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Prisma 7 with `@prisma/adapter-pg` (see `docs/learning.md` L-002)
- Supabase Postgres + Supabase Storage
- Clerk authentication (Clerk v7; `proxy.ts`, see `docs/learning.md` L-003 / L-004)
- Stripe embedded checkout
- Vercel deployment

## Directory layering

```
app/                   route composition only
components/{domain}/   reusable UI, organized by domain
prisma/                schema + seeds + migrations
utils/                 server actions and shared helpers
docs/                  PLAN.md companions: learning, architecture, manual
```

### `app/` — routes only

`app/` holds route-segment files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, plus `template.tsx` and `default.tsx` when needed. It also holds the root `layout.tsx`, `providers.tsx`, `globals.css`, and `theme-provider.tsx` that wire the app shell.

It does **not** hold reusable components, even when only one route currently uses them. Promote a component out of `app/` and into `components/{domain}/` the first time it is created.

### `components/{domain}/` — reusable UI

Reusable UI is organized by domain folder, not by route. Existing domains include `ui` (shadcn primitives), `global`, `navbar`, `home`, `products`, `single-product`, `cart`, `form`, `admin`. Add a new domain folder when none of the existing ones fit; do not co-locate components inside `app/` to avoid the choice.

### Admin in particular

- `app/admin/` is the admin route tree: `layout.tsx`, `page.tsx`, and nested route folders (`sales/`, `products/`, `products/create/`, etc.).
- `components/admin/` is reusable admin UI: `Sidebar.tsx`, admin-only tables, dashboards, forms, and similar widgets.
- A component used by exactly one admin route still lives under `components/admin/`. Single-use is not a justification for co-locating in `app/admin/`.

## When `PLAN.md` examples conflict with these rules

`PLAN.md` describes intent and acceptance gates. Its example paths are illustrative, not normative. When a `PLAN.md` snippet places a reusable component inside `app/` (e.g. `app/admin/Sidebar.tsx`), follow the architecture rule and put it under `components/{domain}/` instead. Note the deviation briefly in the relevant phase notes or in `docs/learning.md` if it could surprise a future agent.

## Other rules

- Keep `.env*` gitignored. Document required keys per phase. Real values live only in `.env`; `.env.example` is a placeholder template.
- Tracked tool/version drift from the source manual lives in `docs/learning.md` (`L-NNN` entries). Add a new entry whenever a deviation will affect future phases.
