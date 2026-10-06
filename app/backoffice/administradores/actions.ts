"use server";

import { revalidatePath } from "next/cache";
import { requireCrmHost } from "@/lib/admin-host";
import { requireUser } from "@/lib/auth";
import { recordCrmEvent } from "@/lib/crm-events";
import { transaction } from "@/lib/transaction";
import {guardInitialAdministratorWithdrawal} from '@/lib/administration-bootstrap';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const serverAdmins = () => String(process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(value=>value&&value!=='master@coonto.com');
export type AccessResult = { ok: boolean; message: string };

async function administrator() {
  await requireCrmHost();
  const user = await requireUser("/backoffice/administradores");
  if (user.role !== "admin") throw new Error("Acesso negado");
  return user;
}

export async function grantAdministrator(_previous: AccessResult, form: FormData): Promise<AccessResult> {
  const actor = await administrator();
  const email = String(form.get("email") || "").trim().toLowerCase();
  if (email.length > 320 || !emailPattern.test(email)) return { ok: false, message: "Informe um e-mail válido." };
  const id = await transaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(170017)");
    const current = await client.query<{ role: string }>("SELECT role FROM users WHERE id=$1", [actor.userId]);
    if (current.rows[0]?.role !== "admin") throw new Error("Acesso negado");
    const result = await client.query<{ id: string }>(`INSERT INTO users(id,email,name,role) VALUES($1,$2,$3,'admin')
      ON CONFLICT(email) DO UPDATE SET role='admin' RETURNING id`, [crypto.randomUUID(), email, email.split("@")[0]]);
    return result.rows[0].id;
  });
  await recordCrmEvent({ type: "admin_granted", userId: actor.userId, relatedType: "user", relatedId: id });
  revalidatePath("/backoffice/administradores");
  return { ok: true, message: `Acesso concedido a ${email}. A pessoa já pode entrar no CRM.` };
}

export async function revokeAdministrator(_previous: AccessResult, form: FormData): Promise<AccessResult> {
  const actor = await administrator();
  const id = String(form.get("id") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === actor.userId) return { ok: false, message: "Não é possível retirar seu próprio acesso." };
  await transaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(170017)");
    const current = await client.query<{ role: string }>("SELECT role FROM users WHERE id=$1", [actor.userId]);
    if (current.rows[0]?.role !== "admin") throw new Error("Acesso negado");
    const target = await client.query<{ email: string; role: string }>("SELECT email,role FROM users WHERE id=$1 FOR UPDATE", [id]);
    if (target.rows[0]?.role !== "admin" || serverAdmins().includes(target.rows[0].email)) throw new Error("Acesso fixado no servidor ou conta inválida");
    const count = await client.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM users WHERE role='admin'");
    if (Number(count.rows[0].total) < 2) throw new Error("Mantenha pelo menos um administrador");
    await guardInitialAdministratorWithdrawal(client,id,actor.userId);
    await client.query("UPDATE users SET role='member' WHERE id=$1", [id]);
    await client.query("UPDATE user_personas SET status='revoked' WHERE user_id=$1 AND persona='owner'",[id]);
    await client.query('DELETE FROM sessions WHERE user_id=$1',[id]);
  });
  await recordCrmEvent({ type: "admin_revoked", userId: actor.userId, relatedType: "user", relatedId: id });
  revalidatePath("/backoffice/administradores");
  return { ok: true, message: "Acesso retirado." };
}
