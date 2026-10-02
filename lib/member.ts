import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const ALIENISTA_SLUG = "o-alienista";

export async function getMember() {
  const user = await getCurrentUser();
  if (!user) return null;
  await query("UPDATE users SET last_seen_at = NOW() WHERE id = $1", [user.userId]);
  return user;
}

export async function ensureAlienistaEntitlement(userId: string) {
  const result = await query<{ id: string }>("SELECT id FROM entitlements WHERE user_id = $1 AND work_slug = $2 AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1", [userId, ALIENISTA_SLUG]);
  return result.rows[0] ?? null;
}
