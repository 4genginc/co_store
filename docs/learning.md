# Learning Log — Next Store

Lightweight ADR-style record of decisions and gotchas discovered while building Next Store. Add entries inline as issues arise — don't batch at session end. Each entry should make future-you faster, not just be a diary.

## Conventions

- New entries at the top (most recent first).
- Each entry has: **ID**, **Date**, **Status**, **Context**, **Decision**, **Migration cost if revisited**.
- Status values: `active` (still in effect) · `superseded` (newer entry replaces it) · `revisited` (we went back and changed it).
- Cross-link from the relevant `PLAN.md` phase so a reader landing in either place finds the other.

---

## L-001 · Prisma pinned to v6 (not v7)

- **Date**: 2026-05-05
- **Status**: active
- **Phase**: 2.1
- **Files**: `package.json`, `prisma/schema.prisma`, `utils/db.ts`

**Context.** `npm install prisma` in May 2026 pulls Prisma 7. Prisma 7 deprecated `url` and `directUrl` properties on the schema `datasource` block — connection URLs now live in a top-level `prisma.config.ts` and the `PrismaClient` is constructed with a driver adapter (e.g., `@prisma/adapter-pg` + `pg`). PLAN.md was written against the older schema-based pattern.

**Decision.** Pinned `prisma@^6` and `@prisma/client@^6`. Schema keeps `url = env("DATABASE_URL")` + `directUrl = env("DIRECT_URL")`. `utils/db.ts` is a vanilla `new PrismaClient()` singleton.

Reasoning: smaller diff against PLAN.md and the underlying tutorial; only one model on disk at decision time; v6 is current-stable, not legacy.

**Migration cost if revisited (move to Prisma 7 later).**

1. `npm install prisma@^7 @prisma/client@^7 @prisma/adapter-pg pg`
2. `prisma/schema.prisma` — drop `url` and `directUrl` from the `datasource db` block (keep `provider`).
3. Add `prisma.config.ts` at repo root that exports the datasource URLs (read from env).
4. `utils/db.ts` — instantiate `PrismaClient` with `{ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) }`.
5. Re-run `prisma generate` and verify `prisma db push` still works.

Estimated effort: ~30 min once Phase 6 (Supabase Storage) and Phase 4 (Clerk) are stable. Don't migrate mid-phase.

---
