import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import {institutionalWorkAccess} from "@/lib/institutional-license-access";

export const ALIENISTA_SLUG = "o-alienista";

export async function getMember() {
  const user = await getCurrentUser();
  if (!user) return null;
  await query("UPDATE users SET last_seen_at = NOW() WHERE id = $1", [user.userId]);
  return user;
}

export async function ensureWorkEntitlement(userId: string,slug:string,usage:"activate"|"used"|null=null) {
  const result = await query<{ id: string;expires_at:Date|null }>("SELECT id,expires_at FROM entitlements WHERE user_id = $1 AND work_slug = $2 AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1", [userId, slug]);
  return result.rows[0] ?? await institutionalWorkAccess(userId,slug,usage);
}

export function ensureAlienistaEntitlement(userId:string,usage:"activate"|"used"|null=null){return ensureWorkEntitlement(userId,ALIENISTA_SLUG,usage);}
