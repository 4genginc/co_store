# Learning Log — Next Store

Lightweight ADR-style record of decisions and gotchas discovered while building Next Store. Add entries inline as issues arise — don't batch at session end. Each entry should make future-you faster, not just be a diary.

## Conventions

- New entries at the top (most recent first).
- Each entry has: **ID**, **Date**, **Status**, **Context**, **Decision**, **Migration cost if revisited**.
- Status values: `active` (still in effect) · `superseded` (newer entry replaces it) · `revisited` (we went back and changed it).
- Cross-link from the relevant `PLAN.md` phase so a reader landing in either place finds the other.

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
