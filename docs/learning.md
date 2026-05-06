# Learning Log — Next Store

Lightweight ADR-style record of decisions and gotchas discovered while building Next Store. Add entries inline as issues arise — don't batch at session end. Each entry should make future-you faster, not just be a diary.

## Conventions

- New entries at the top (most recent first).
- Each entry has: **ID**, **Date**, **Status**, **Context**, **Decision**, **Migration cost if revisited**.
- Status values: `active` (still in effect) · `superseded` (newer entry replaces it) · `revisited` (we went back and changed it).
- Cross-link from the relevant `PLAN.md` phase so a reader landing in either place finds the other.

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
