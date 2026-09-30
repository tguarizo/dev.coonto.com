import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { hashToken, sessionCookie } from "@/lib/auth";
import { query } from "@/lib/db";
import { recordCrmEvent } from "@/lib/crm-events";
import {consumeLoginCode} from '@/lib/login-code';

const normalize = (value: unknown) => String(value || "").trim().toLowerCase().slice(0, 320);
const hashCode = (email: string, code: string) => createHmac("sha256", process.env.AUTH_SECRET || "").update(`${email}:${code}`).digest("hex");

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; code?: string; returnTo?: string };
  const email = normalize(body.email);
  const code = String(body.code || "").trim();
  if (!/^\d{6}$/.test(code)) return Response.json({ error: "Informe o código de seis números." }, { status: 400 });
  const suppliedHash = hashCode(email, code);
  const checked=await consumeLoginCode(email,suppliedHash);
  if(!checked.ok)return Response.json({error:checked.error},{status:401});
  const name = email.split("@")[0];
  const userResult = await query<{ id: string }>(`INSERT INTO users (id,email,name) VALUES ($1,$2,$3) ON CONFLICT (email) DO UPDATE SET last_seen_at=NOW() RETURNING id`, [crypto.randomUUID(), email, name]);
  const userId = userResult.rows[0].id;
  const referralCode = (await cookies()).get("coonto_ref")?.value;
  if (referralCode && /^[A-Z0-9]{12}$/.test(referralCode)) {
    try {
      await query(`INSERT INTO referral_attributions(user_id,referral_id)
        SELECT $1,id FROM partner_referrals WHERE code=$2 AND active=TRUE
        ON CONFLICT (user_id) DO NOTHING`, [userId, referralCode]);
    } catch (error) { console.error("referral_attribution_failed", error); }
  }
  const admins = String(process.env.ADMIN_EMAILS || "").split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
  if (admins.includes(email)) await query("UPDATE users SET role='admin' WHERE id=$1", [userId]);
  const token = randomBytes(32).toString("base64url");
  await query("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,NOW() + INTERVAL '30 days')", [hashToken(token), userId]);
  (await cookies()).set(sessionCookie.name, token, sessionCookie.options);
  await recordCrmEvent({ type: "login_succeeded", userId, channel: "email" });
  const returnTo = body.returnTo?.startsWith("/") && !body.returnTo.startsWith("//") ? body.returnTo : "/minha-biblioteca";
  return Response.json({ ok: true, returnTo });
}
