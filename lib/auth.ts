import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

export type CoontoUser = { userId: string; email: string; displayName: string; accountKind:string; role: "member" | "admin" };
const COOKIE_NAME = "coonto_session";
const DEVICE_COOKIE_NAME = "coonto_device";

export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function getCurrentUser(): Promise<CoontoUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await query<{ id: string; email: string; name: string; account_kind:string; role: "member" | "admin" }>(
    `SELECT u.id, COALESCE(u.email,'') AS email, u.name, u.role, u.account_kind FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() LIMIT 1`, [hashToken(token)]);
  const user = result.rows[0];
  if (!user) return null;
  const deviceToken=(await cookies()).get(DEVICE_COOKIE_NAME)?.value;
  if(deviceToken) void query("UPDATE auth_devices SET last_seen_at=NOW() WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL AND trusted_until>NOW()",[user.id,hashToken(deviceToken)]).catch(()=>{});
  return { userId: user.id, email: user.email, displayName: user.name, accountKind:user.account_kind, role: user.role };
}

export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(loginPath(returnTo));
}

export function loginPath(returnTo = "/minha-biblioteca") {
  const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return `/login?return_to=${encodeURIComponent(safe)}`;
}

export function logoutPath(returnTo = "/") {
  const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return `/api/auth/logout?return_to=${encodeURIComponent(safe)}`;
}

export const sessionCookie = { name: COOKIE_NAME, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 } };

export const deviceCookie = { name: DEVICE_COOKIE_NAME, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 90 } };
