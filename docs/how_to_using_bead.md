# Chat with workers (2026-05-04)

---

## Quick Beads

## Purpose

This is the short repeatable version of the Beads workflow used to rebuild the Auth System demo.

Use this when you want a fast practice run without re-reading the full detailed guide.

---

## Step 1 — Create the project beads

Initialize Beads and Claude Code integration:

```bash
bd init
bd setup claude
```

Create the parent epic:

```bash
bd create "Auth System" -t epic
bd list
```

Copy the actual epic ID from `bd list`.

Example:

```text
my_beads-abc
```

Create child beads:

```bash
bd create "Design UI" --parent my_beads-abc
bd create "Backend" --parent my_beads-abc
bd create "Tests" --parent my_beads-abc
```

Expected structure:

```text
my_beads-abc       Auth System
├── my_beads-abc.1 Design UI
├── my_beads-abc.2 Backend
└── my_beads-abc.3 Tests
```

---

## Step 2 — Make the first bead executable

Update the Design UI bead with a real task contract:

```bash
bd update my_beads-abc.1 \
  --description "Design auth UI wireframes for a Next.js 16 web app covering login, signup, and password reset only. Output ASCII wireframes only, no code." \
  --acceptance "ASCII wireframes exist for login, signup, and password reset; include fields, buttons, error states, and navigation links; no code scaffolded."
```

---

```
bd update test_beads-xyz.1 \
  --description "Scaffold authentication UI pages for a Next.js 16 web app covering login, signup, and password reset only. Implement UI code only; do not implement backend auth logic yet." \
  --acceptance "Next.js auth UI pages exist for login, signup, reset request, and reset confirm; forms include fields, buttons, error/loading placeholders, and navigation links; UI builds/typechecks; no backend auth logic implemented."

bd update test_beads-xyz.1 --claim
```

Claim it:

```bash
bd update my_beads-abc.1 --claim
```

Prompt Claude Code:

```text
Please complete the claimed Design UI bead only. Produce the artifact, then report validation against acceptance criteria.
```

---

## Step 3 — Close and repeat

After the agent completes the UI design and it satisfies acceptance criteria:

```bash
bd close my_beads-abc.1 --reason "UI wireframes completed and validated"
bd update my_beads-abc.2 --claim
```

Then prompt Claude Code for Backend:

```text
Complete Backend using Next.js 16, Prisma + SQLite, argon2, httpOnly cookie sessions, reset tokens hashed at rest, single-use, TTL 1 hour. Stub email to console.

Before coding, update the Backend bead with description, acceptance criteria, assumptions, and backend design notes.

After implementation, run:

npm install
npx prisma migrate dev --name init
npx tsc --noEmit

Do not ask to close the bead until those checks pass.
```

or

```
bd update test_beads-bs1.2 \
  --description "Implement the auth backend for a Next.js 16 app using Prisma + SQLite, argon2 password hashing, httpOnly cookie sessions, and password reset tokens. Stub reset email delivery to console." \
  --acceptance "Backend supports signup, login, logout/session handling, password reset request, and password reset confirm; reset tokens are hashed at rest, single-use, and expire after 1 hour; implementation passes npm install, prisma migrate, and TypeScript typecheck."

bd update test_beads-bs1.2 --claim


```

After Backend passes validation:

```bash
bd close my_beads-abc.2 --reason "Backend auth implementation installed, migrated, and typechecked"
bd update my_beads-abc.3 --claim
```

Prompt Claude Code for Tests:

```text
Complete Tests for the auth backend.

Scope:
- signup
- login success/failure
- logout/session behavior
- password reset request
- password reset confirm
- reset token expiration and single-use behavior
- session invalidation after password reset

Add only the minimal test framework/config needed.

After implementation, run:

npm test
npx tsc --noEmit

Do not ask to close the bead until tests and typecheck pass.
```

After Tests pass:

```bash
bd close my_beads-abc.3 --reason "Auth tests implemented and passing"
bd close my_beads-abc --reason "Auth System complete: UI design, backend implementation, and tests all passed"
```

---

## Core loop

```text
create bead
↓
add description + acceptance criteria
↓
claim bead
↓
agent works
↓
validate
↓
close bead
↓
repeat
```

---

## Important reminders

Use the real ID returned by Beads. Do not copy placeholder IDs from examples.

Correct flag:

```bash
--acceptance
```

Not:

```bash
--ac
```

Do not close a bead only because files were written. Close only after validation passes.

For this demo, validation means:

```bash
npm install
npx prisma migrate dev --name init
npm test
npx tsc --noEmit
```
---


