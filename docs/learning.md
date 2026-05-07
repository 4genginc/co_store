# Learning Log — Next Store

Lightweight ADR-style record of decisions and gotchas discovered while building Next Store. Add entries inline as issues arise — don't batch at session end. Each entry should make future-you faster, not just be a diary.

## Conventions

- New entries at the top (most recent first).
- Each entry has: **ID**, **Date**, **Status**, **Context**, **Decision**, **Migration cost if revisited**.
- Status values: `active` (still in effect) · `superseded` (newer entry replaces it) · `revisited` (we went back and changed it).
- Cross-link from the relevant `PLAN.md` phase so a reader landing in either place finds the other.

---

## L-009 · `<SignInButton>` from `@clerk/nextjs` must be wrapped in a `"use client"` component when used from an async server component

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 8.1
- **Files**: `components/products/FavoriteSignInPrompt.tsx`, `components/products/FavoriteToggleButton.tsx`

**Context.** Phase 8.1 needed `FavoriteToggleButton` to render a Clerk `<SignInButton mode="modal">` for signed-out users and a toggle form for signed-in users. The natural shape was an async server component that calls `auth()`, branches on `userId`, and returns one of:

```tsx
return (
  <SignInButton mode="modal">
    <button …><FaRegHeart /></button>
  </SignInButton>
);
```

That render path crashed with `@clerk/react: You've passed multiple children components to <SignInButton/>. You can only pass a single child component or text.` even though there is one JSX child. Internally `SignInButton` runs `React.Children.only(children)`, which throws when the children prop arrives as anything other than a single element — and when an async RSC renders a Clerk client component as a direct child, the children prop materializes as something `Children.only` rejects (likely the RSC payload's element-list shape, not a single element). `LinksDropdown` doesn't hit this because there's a Radix `<DropdownMenuItem>` (a client component) sitting between the server boundary and `<SignInButton>`, which means `<SignInButton>` is reached through a real client render path where the children prop is a normal single element.

**Decision.** When using a Clerk button (`SignInButton`, `SignUpButton`, `SignOutButton`, etc.) directly from an async server component, wrap the entire Clerk-button-plus-its-child in a small `"use client"` component and render *that* from the server component. The Clerk button now sits in a normal client render and `Children.only` succeeds.

```tsx
// components/products/FavoriteSignInPrompt.tsx
"use client";
import { SignInButton } from "@clerk/nextjs";
export default function FavoriteSignInPrompt() {
  return (
    <SignInButton mode="modal">
      <button …><FaRegHeart /></button>
    </SignInButton>
  );
}

// FavoriteToggleButton.tsx (server)
if (!userId) return <FavoriteSignInPrompt />;
```

**Failure mode this avoids.** The error doesn't surface in tsc, only at runtime, and the resulting page returns 500 — so this would have shipped silently if not for the smoke test. Future contributors reaching for `<SignInButton>` in a server component need a rule, not a workaround memorized only by whoever debugged it once.

**Rule of thumb.** Any Clerk button component is a client primitive that wants its children handed to it from another client. Mix it directly with a server-only branch only via a `"use client"` wrapper. If you must inline it, a Radix client wrapper (`DropdownMenuItem`, etc.) sitting between also works — but a dedicated wrapper is clearer.

**Migration cost if revisited.** If a future Clerk version makes `<SignInButton>` accept children directly from a server component, the wrapper becomes one indirection of dead weight — delete the `Favorite*Prompt` file and inline the JSX. Each call site is ~10 lines; ~5 minutes per site to migrate.

---

## L-008 · Server actions and server-only queries live in different files (`utils/actions.ts` vs `utils/queries.ts`)

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 7.2
- **Files**: `utils/actions.ts`, `utils/queries.ts`

**Context.** PLAN.md describes everything as living in `utils/actions.ts` — both server-only data fetchers (`fetchFeaturedProducts`, `fetchSingleProduct`) and server actions invoked from client components (`createProductAction`, `deleteProductAction`). That works only as long as no client component imports from the file. The first time a client component (`DeleteProductForm.tsx`) imported `deleteProductAction`, Next.js refused to build:

> It is not allowed to define inline `"use server"` annotated Server Actions in Client Components.

Inline `"use server"` directives only work for server actions defined inside server components. When a *client* component imports a function from a module, the entire module is treated as client-bundled — and Next.js requires a top-level `"use server"` directive to mark exports as server actions instead. But putting `"use server"` at the top of a mixed module turns the data fetchers into server actions too, which is wrong (they'd become RPC endpoints with extra overhead and a different security surface).

**Decision.** Split by *call site*, not by domain:

- **`utils/actions.ts`** — `"use server"` at the top. Contains only functions that are invoked from client components (server actions). Currently: `createProductAction`, `deleteProductAction`. Adding more in later phases (`updateProductAction`, `toggleFavoriteAction`, etc.) goes here.
- **`utils/queries.ts`** — no directive. Contains server-only data fetchers called from server components. Currently: `fetchFeaturedProducts`, `fetchAllProducts`, `fetchSingleProduct`, `fetchAdminProducts`.

This deviates from PLAN.md's single-`actions.ts` convention but matches the Next.js App Router constraint. PLAN.md's example `bd create` blocks reference fetch helpers and action helpers without distinguishing files; treat any future PLAN.md reference to `utils/actions.ts` as "the right of the two files" and pick by call site.

**Rule of thumb when adding a new function.**

- *Will a client component (`"use client"` file) import this?* → `utils/actions.ts`.
- *Only server components / route handlers?* → `utils/queries.ts`.

**Migration cost if revisited.** If a future Next.js version supports inline `"use server"` from client-imported modules, we could collapse back to one file by deleting the directive at the top of `actions.ts` and adding inline directives. But the split actually reads cleaner (intent is visible at the file level), so we'd probably keep it. ~5 min to merge if we ever wanted to.

---

## L-007 · Supabase Storage RLS is a backstop, not the auth boundary (Clerk-not-Supabase-Auth setup)

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 6.4
- **Files**: `utils/supabase.ts`, `utils/admin.ts`, Supabase Storage policy on `product-images`

**Context.** Auth is Clerk; Storage is Supabase. The `@supabase/supabase-js` client we instantiate in `utils/supabase.ts` uses the publishable key, which means every Storage call hits Supabase as the `anon` Postgres role — Supabase has no idea who the Clerk-signed-in user is. Default Supabase Storage RLS denies INSERT/UPDATE/DELETE for `anon`, so the first real upload hit `new row violates row-level security policy` even though the bucket was marked "public" (which only governs reads).

**Decision.** As a deliberate bridge design:

- **Auth boundary lives in Next.js, not Supabase.** The proxy gate on `/admin/*` (`isAdmin`) plus `getAdminUser()` inside `createProductAction` is what actually enforces "only admins can create products." Supabase RLS is a backstop, not the primary boundary.
- **Permissive dev policy on `product-images`.** A single policy grants `anon` + `authenticated` full access (`SELECT/INSERT/UPDATE/DELETE`) scoped to `bucket_id = 'product-images'`. This unblocks Phase 6 without forcing us to wire a Clerk→Supabase JWT bridge before we have any product data.
- **One client, one role.** All Storage operations go through the single `supabase` client in `utils/supabase.ts`. We don't quietly slip in a service-role key (which would bypass RLS entirely and is far worse than a permissive policy because it removes the bucket-scope guard).

**Failure mode this avoids.** Adding a `SUPABASE_SERVICE_ROLE_KEY` for the upload path would silently grant the server full database access, including tables we never intended to expose. Permissive RLS scoped to `product-images` keeps the blast radius bounded to that bucket.

**Future migration path.** When we want Supabase RLS to actually carry weight (multi-tenant data, customer uploads, etc.):

1. Stand up a Clerk → Supabase JWT bridge (Clerk JWT template signed with Supabase JWT secret).
2. On the client/server, call `supabase.auth.setSession({ access_token })` with the Clerk-issued JWT.
3. Replace the permissive `product-images` policy with one keyed on `auth.jwt()` (e.g., admin role claim).
4. Tighten further policies on any new buckets/tables as they appear.
5. Mark this entry `superseded` and link to the migration entry.

**Migration cost if revisited.** Trivial to roll back to "no policy" by dropping the policy in the SQL editor. Migrating *forward* to JWT-based RLS is the real exit cost: ~half a day for the JWT template, session wiring, and policy rewrite.

---

## L-006 · Supabase publishable key (`sb_publishable_…`) replaces legacy `anon` key

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 6.3
- **Files**: `utils/supabase.ts`, `.env`, `.env.example`

**Context.** Supabase projects created mid-2025+ issue **publishable** keys (`sb_publishable_…`) in the dashboard's Project Settings → "Framework" tab and ship them via `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. This replaces the legacy **anon** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) that older tutorials and a lot of community code still reference. Both names are accepted by `@supabase/supabase-js` `createClient` — the client just wants a string — so the choice is purely about which env var name we standardize on.

**Decision.** Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` everywhere. The Supabase client in `utils/supabase.ts` reads only this name. The legacy `…_ANON_KEY` name is not supported as a fallback — if a contributor's `.env` carries the older name, the client will fail to construct and the error will be loud, which is preferable to silently mixing key styles across environments.

**Migration cost if revisited.** Trivial — rename the env var in `.env`, `.env.example`, and the single `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` reference in `utils/supabase.ts`. Estimated effort: ~1 minute.

---

## L-005 · `ADMIN_USER_IDS` as a bootstrap authorization mechanism

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 5.2
- **Files**: `utils/admin.ts`, `proxy.ts`, `components/navbar/LinksDropdown.tsx`, `.env`

**Context.** PLAN.md 5.2 prescribes a singular `ADMIN_USER_ID` env var: one Clerk user is "the admin." The `.env.example` carried over from earlier scaffolding already used the plural `ADMIN_USER_IDS` (comma-separated). Phase 5 is the first time admin authorization actually has teeth, so this is the moment to commit to the plural shape rather than retrofit later.

**Decision.** Use `ADMIN_USER_IDS` (comma-separated Clerk user IDs) as a deliberate bridge design, not just a convenience deviation:

- **Bootstrap-only purpose.** `ADMIN_USER_IDS` exists to grant admin to one or more *initial* users without requiring a database role/permission system on day one. Phase 5 is too early to ship a roles table, an admin-management UI, or invitations.
- **Fail closed.** When the env var is unset, empty, or all-whitespace, the helper must return `false` for every `userId`. No env value ⇒ no admins. The site behaves as if there are no admins, never as if anyone is.
- **One helper, one source of truth.** All admin checks (proxy gate on `/admin/*`, conditional UI in `LinksDropdown`, future server actions) go through a single `isAdmin(userId)` helper in `utils/admin.ts`. Route files do not parse `ADMIN_USER_IDS` directly. This keeps the policy reversible from one file.
- **Plural from day one.** Singular would mean rewriting the helper and every caller the moment we want a second admin. The cost of the plural form today is one `.split(",")`.

**Future migration path.** When the project is ready for real authorization:

1. Add a `Role` (or `permission`) model in Prisma.
2. Backfill the existing `ADMIN_USER_IDS` entries into the new table (one-time script).
3. Replace `isAdmin(userId)` to read from the database (with caching) instead of the env var.
4. Add an admin-management UI (invite / promote / demote) so the env var stops being touched in production.
5. Mark this entry `superseded` and link to the migration entry.

The env-var stage is meant to be temporary scaffolding. It should not grow features (per-permission flags, granular scopes); the moment that pressure appears, build the database model.

**Migration cost if revisited.** Trivial to fall back to singular: change `.split(",")` to a single value and update `.env`. Migrating *forward* to a roles table is the real exit cost — see steps above; estimated ~1 day for model + backfill + admin UI when the time comes.

---

## L-004 · Clerk v7 replaced `<SignedIn>`/`<SignedOut>` with unified `<Show when=...>`

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 4.3
- **Files**: `components/navbar/LinksDropdown.tsx`

**Context.** `@clerk/nextjs` v7 (the version `npm install @clerk/nextjs` resolves to in May 2026) removed the `SignedIn` and `SignedOut` named exports. They're replaced by a single async server component:

```tsx
<Show when="signed-in">…</Show>
<Show when="signed-out">…</Show>
```

`Show` also accepts `permission`, `role`, or a function predicate, so it subsumes the prior `<Protect>` component as well.

**Decision.** Use `<Show when="signed-in">` / `<Show when="signed-out">` in place of `<SignedIn>` / `<SignedOut>` throughout the app. Tutorial-style code that imports `SignedIn`/`SignedOut` from `@clerk/nextjs` will fail TypeScript with `TS2305: Module ... has no exported member 'SignedOut'`.

**Migration cost if revisited.** If we ever pin Clerk back to v6, swap each `<Show when="signed-in">` for `<SignedIn>` and update the import. ~2 minutes per occurrence.

---

## L-003 · Next 16 renamed `middleware.ts` → `proxy.ts`

- **Date**: 2026-05-06
- **Status**: active
- **Phase**: 4.2
- **Files**: `proxy.ts`

**Context.** Next.js 16 deprecated the `middleware.ts` file convention. Keeping the file at `middleware.ts` still works but emits a startup warning: *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."* Internally Next 16 already labels middleware timings as `proxy.ts` in dev logs.

**Decision.** Use `proxy.ts` at the project root. The exported function is still produced by Clerk's `clerkMiddleware()` — only the filename changes. PLAN.md Phase 4.2 was written against the old name; we're deviating to track Next 16.

**Clerk-side note.** With Clerk v7, `auth.protect()` defaults to a 404 for unauthenticated non-API requests. To get the conventional sign-in redirect that the bead's "private routes require sign-in" implies, destructure `redirectToSignIn` from `auth()` and call it explicitly when `userId` is falsy. The 404 default is intentional (hides protected resource existence) but does not match the manual's UX expectation.

**Migration cost if revisited.** Trivial — rename file back to `middleware.ts` and accept the deprecation warning until Next removes the alias. Estimated effort: ~30 sec.

---

## L-002 · Prisma 7 with driver adapter (PrismaPg)

- **Date**: 2026-05-05
- **Status**: active
- **Phase**: 2.1
- **Files**: `package.json`, `prisma/schema.prisma`, `prisma.config.ts`, `utils/db.ts`, `prisma/seed.js`
- **Supersedes**: L-001

**Context.** Prisma 7 deprecated `url`/`directUrl` properties on the schema `datasource` block and split connection-URL ownership across two surfaces:

- **Migration / introspection time** (`prisma generate`, `prisma db push`, `prisma migrate`): config lives in `prisma.config.ts` at repo root.
- **Runtime** (`PrismaClient` in app + scripts): config flows through a driver adapter (`@prisma/adapter-pg` for Postgres, which wraps the `pg` driver).

**Decision.** Adopted Prisma 7 across the board.

Layout:

| File | Purpose | Connection string |
|------|---------|-------------------|
| `prisma/schema.prisma` | Provider only — no `url`/`directUrl` | — |
| `prisma.config.ts` | Read by Prisma CLI for migrations | `DIRECT_URL` (Supabase direct, port 5432, supports DDL) |
| `utils/db.ts` | App-side Prisma client | `DATABASE_URL` (Supabase pooled, port 6543) via `PrismaPg` adapter |
| `prisma/seed.js` | One-off seed | `DATABASE_URL` via `PrismaPg` adapter |

**Why split URLs.** Supabase's pooled connection (pgBouncer transaction mode) doesn't support all DDL statements — migrations need a direct connection. Runtime queries do best on the pool.

**`.env` loading caveat.**

- `prisma.config.ts` runs under the Prisma CLI. To make sure `process.env.DIRECT_URL` is populated, the file imports `'dotenv/config'` at the top.
- `prisma/seed.js` runs under plain Node. Same fix: `require('dotenv/config')` at the top.
- `utils/db.ts` runs inside Next.js, which loads `.env` automatically — no explicit dotenv import needed.

**Trade-off accepted.** One extra config file (`prisma.config.ts`), two extra deps (`@prisma/adapter-pg`, `pg`), and a runtime-only `dotenv` for the seed script. In exchange, we're on the current major and won't need a v6→v7 migration later.

**Migration cost if revisited.** If we ever need to roll back to v6 (unlikely): pin `prisma@^6` + `@prisma/client@^6`, drop `prisma.config.ts`, restore `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")` to the schema, drop adapter from `PrismaClient` constructor in `utils/db.ts` and `prisma/seed.js`. Estimated effort: ~15 min.

---

## L-001 · Prisma pinned to v6 (not v7) — *superseded by L-002*

- **Date**: 2026-05-05
- **Status**: revisited
- **Phase**: 2.1
- **Files (at the time)**: `package.json`, `prisma/schema.prisma`, `utils/db.ts`

**Context.** `npm install prisma` in May 2026 pulls Prisma 7. Prisma 7 deprecated `url` and `directUrl` properties on the schema `datasource` block — connection URLs now live in a top-level `prisma.config.ts` and the `PrismaClient` is constructed with a driver adapter (e.g., `@prisma/adapter-pg` + `pg`). PLAN.md was originally written against the older schema-based pattern.

**Decision (initial).** Pinned `prisma@^6` + `@prisma/client@^6` to keep the tutorial pattern intact for one phase.

**Why revisited.** Right after Phase 2.3 closed, we did a controlled foundation cleanup before Phase 3 (one model, no app code depending on the old shape) and migrated to v7 with the adapter pattern. See **L-002**.

---
