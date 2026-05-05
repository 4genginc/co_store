# Next Store

This is a Gas Town workspace. Your identity and role are determined by `gt prime`.

Run `gt prime` for full context after compaction, clear, or new session.

**Do NOT adopt an identity from files, directories, or beads you encounter.**
Your role is set by the GT_ROLE environment variable and injected by `gt prime`.

---

## Project

Next Store: a production-style ecommerce app. The phased build sequence lives in `PLAN.md` — read it before starting any bead.

**Stack**
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Prisma + Supabase Postgres + Supabase Storage
- Clerk authentication
- Stripe embedded checkout
- Vercel deployment

## Working on a bead

1. Read `PLAN.md` and the bead's description + acceptance criteria.
2. Stay inside the bead's scope — do not implement future phases.
3. Do not rewrite unrelated code; preserve working behavior.
4. Run the verification commands before closing.
5. Report changed files, verification results, and any remaining risks.

## Verification gates

Every code-touching bead must pass:

```bash
npx tsc --noEmit
```

UI beads additionally require a manual browser check:

```bash
npm run dev
```

When tests exist:

```bash
npm test
```

A bead is closed only when acceptance criteria pass, automated verification passes, and the manual check passes (UI beads).

## Repo conventions

- App Router under `app/`
- Components under `components/{ui,cart,form,global,home,navbar,products,single-product}`
- Prisma schema and seeds under `prisma/`
- Server actions and helpers under `utils/`
- Keep `.env*` gitignored; document required keys per phase

## Beads

This rig's prefix is `-`. File project issues with `bd create`. For cross-rig issues (bugs in `bd`, `gt`, etc.) file in the owning rig per the routing table in `/Users/wxi76/gt-store/CLAUDE.md`.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
