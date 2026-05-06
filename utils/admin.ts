// Bootstrap admin authorization. See docs/learning.md L-005 for the design
// rationale and migration path to a database-backed role model.
//
// Reads the comma-separated ADMIN_USER_IDS env var and exposes a single
// isAdmin(userId) entry point. Fails closed: if the env var is unset, empty,
// or all-whitespace, every check returns false.

function parseAdminIds(): ReadonlySet<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return new Set(ids);
}

const adminIds = parseAdminIds();

export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return adminIds.has(userId);
}
