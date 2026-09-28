"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { requireCrmHost } from "@/lib/admin-host";
import { query } from "@/lib/db";
import { recordCrmEvent } from "@/lib/crm-events";
import { transaction } from "@/lib/transaction";
import { ALIENISTA_SLUG } from "@/lib/member";

async function admin() {
  await requireCrmHost();
  const user = await requireUser("/backoffice/crm");
  if (user.role !== "admin") throw new Error("Acesso negado");
}
function field(form: FormData, key: string, limit = 200) {
  return String(form.get(key) || "").trim().slice(0, limit);
}
function done(path = "/backoffice/crm", area?: string) { revalidatePath(path); redirect(`${path}?${area ? `area=${area}&` : ""}salvo=1`); }

export async function updateLead(form: FormData) {
  await admin();
  const id = field(form, "id"), status = field(form, "status");
  if (!id || !["new", "contacted", "qualified", "closed"].includes(status)) throw new Error("Dados inválidos");
  await query("UPDATE partner_leads SET status=$1 WHERE id=$2", [status, id]);
  await recordCrmEvent({ type: "lead_stage_changed", relatedType: "partner_lead", relatedId: id, metadata: { stage: status } });
  done("/backoffice/crm", "relacionamentos");
}

export async function createOrganization(form: FormData) {
  await admin();
  const name = field(form, "name"), kind = field(form, "kind");
  if (!name || !["school", "course", "partner"].includes(kind)) throw new Error("Organização inválida");
  const id = crypto.randomUUID();
  await query("INSERT INTO organizations(id,name,kind) VALUES($1,$2,$3)", [id, name, kind]);
  await recordCrmEvent({ type: "organization_created", organizationId: id, metadata: { kind } });
  done("/backoffice/crm", "organizacoes");
}

export async function addMember(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), email = field(form, "email", 320).toLowerCase(), role = field(form, "role");
  if (!organizationId || !email || !["manager", "teacher", "student"].includes(role)) throw new Error("Vínculo inválido");
  const found = await query<{ id: string }>("SELECT id FROM users WHERE email=$1", [email]);
  if (!found.rows[0]) throw new Error("Conta não encontrada. A pessoa precisa entrar no Coonto primeiro.");
  await transaction(async client => {
    const current = await client.query<{ role: string }>("SELECT role FROM organization_memberships WHERE organization_id=$1 AND user_id=$2 FOR UPDATE", [organizationId, found.rows[0].id]);
    if (current.rows[0] && current.rows[0].role !== role) {
      const active = await client.query("SELECT 1 FROM license_assignments WHERE organization_id=$1 AND user_id=$2 AND status='active' LIMIT 1", [organizationId, found.rows[0].id]);
      if (active.rowCount) throw new Error("Revogue as licenças antes de alterar a função do aluno");
      const classrooms = await client.query(`SELECT 1 FROM classroom_enrollments WHERE organization_id=$1 AND user_id=$2
        UNION ALL SELECT 1 FROM classroom_teachers WHERE organization_id=$1 AND user_id=$2 LIMIT 1`, [organizationId, found.rows[0].id]);
      if (classrooms.rowCount) throw new Error("Remova os vínculos com turmas antes de alterar a função");
    }
    await client.query(`INSERT INTO organization_memberships(organization_id,user_id,role) VALUES($1,$2,$3)
      ON CONFLICT (organization_id,user_id) DO UPDATE SET role=EXCLUDED.role`, [organizationId, found.rows[0].id, role]);
  });
  done("/backoffice/crm", "organizacoes");
}

export async function createClassroom(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), name = field(form, "name");
  if (!organizationId || !name) throw new Error("Turma inválida");
  await query("INSERT INTO classrooms(id,organization_id,name) VALUES($1,$2,$3)", [crypto.randomUUID(), organizationId, name]);
  done("/backoffice/crm", "organizacoes");
}

export async function enrollStudent(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), classroomId = field(form, "classroom_id"), userId = field(form, "user_id");
  const member = await query("SELECT 1 FROM organization_memberships WHERE organization_id=$1 AND user_id=$2 AND role='student'", [organizationId, userId]);
  if (!member.rowCount) throw new Error("Aluno não pertence a esta organização");
  await query(`INSERT INTO classroom_enrollments(organization_id,classroom_id,user_id) VALUES($1,$2,$3)
    ON CONFLICT (classroom_id,user_id) DO NOTHING`, [organizationId, classroomId, userId]);
  await recordCrmEvent({ type: "student_enrolled", organizationId, userId, relatedType: "classroom", relatedId: classroomId });
  done("/backoffice/crm", "organizacoes");
}

export async function assignTeacher(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), classroomId = field(form, "classroom_id"), userId = field(form, "user_id");
  const member = await query("SELECT 1 FROM organization_memberships WHERE organization_id=$1 AND user_id=$2 AND role='teacher'", [organizationId, userId]);
  if (!member.rowCount) throw new Error("Professor não pertence a esta organização");
  await query(`INSERT INTO classroom_teachers(organization_id,classroom_id,user_id) VALUES($1,$2,$3)
    ON CONFLICT (classroom_id,user_id) DO NOTHING`, [organizationId, classroomId, userId]);
  await recordCrmEvent({ type: "teacher_assigned", organizationId, userId, relatedType: "classroom", relatedId: classroomId });
  done("/backoffice/crm", "organizacoes");
}

export async function removeFromClassroom(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), classroomId = field(form, "classroom_id"), userId = field(form, "user_id"), role = field(form, "role");
  if (!organizationId || !classroomId || !userId || !["student", "teacher"].includes(role)) throw new Error("Vínculo inválido");
  const table = role === "student" ? "classroom_enrollments" : "classroom_teachers";
  await query(`DELETE FROM ${table} WHERE organization_id=$1 AND classroom_id=$2 AND user_id=$3`, [organizationId, classroomId, userId]);
  await recordCrmEvent({ type: "classroom_member_removed", organizationId, userId, relatedType: "classroom", relatedId: classroomId, metadata: { role } });
  done("/backoffice/crm", "organizacoes");
}

export async function setSeats(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), seats = Number(field(form, "seats"));
  if (!organizationId || !Number.isInteger(seats) || seats < 0 || seats > 100000) throw new Error("Quantidade inválida");
  await transaction(async client => {
    await client.query(`INSERT INTO license_pools(organization_id,work_slug,seats) VALUES($1,$2,0)
      ON CONFLICT (organization_id,work_slug) DO NOTHING`, [organizationId, ALIENISTA_SLUG]);
    await client.query("SELECT 1 FROM license_pools WHERE organization_id=$1 AND work_slug=$2 FOR UPDATE", [organizationId, ALIENISTA_SLUG]);
    const used = await client.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM license_assignments WHERE organization_id=$1 AND work_slug=$2 AND status='active'", [organizationId, ALIENISTA_SLUG]);
    if (seats < Number(used.rows[0].total)) throw new Error("Há mais licenças ativas do que o novo limite");
    await client.query("UPDATE license_pools SET seats=$1 WHERE organization_id=$2 AND work_slug=$3", [seats, organizationId, ALIENISTA_SLUG]);
  });
  done("/backoffice/crm", "organizacoes");
}

export async function assignLicense(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), userId = field(form, "user_id");
  if (!organizationId || !userId) throw new Error("Licença inválida");
  await transaction(async client => {
    const pool = await client.query<{ seats: number }>("SELECT seats FROM license_pools WHERE organization_id=$1 AND work_slug=$2 FOR UPDATE", [organizationId, ALIENISTA_SLUG]);
    if (!pool.rows[0]) throw new Error("Defina as vagas da organização primeiro");
    const member = await client.query("SELECT 1 FROM organization_memberships WHERE organization_id=$1 AND user_id=$2 AND role='student' FOR UPDATE", [organizationId, userId]);
    if (!member.rowCount) throw new Error("Aluno não pertence a esta organização");
    const existing = await client.query<{ status: string }>("SELECT status FROM license_assignments WHERE organization_id=$1 AND user_id=$2 AND work_slug=$3", [organizationId, userId, ALIENISTA_SLUG]);
    if (existing.rows[0]?.status === "active") return;
    const used = await client.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM license_assignments WHERE organization_id=$1 AND work_slug=$2 AND status='active'", [organizationId, ALIENISTA_SLUG]);
    if (Number(used.rows[0].total) >= pool.rows[0].seats) throw new Error("Todas as vagas estão ocupadas");
    await client.query(`INSERT INTO license_assignments(id,organization_id,user_id,work_slug) VALUES($1,$2,$3,$4)
      ON CONFLICT (organization_id,user_id,work_slug) DO UPDATE SET status='active',updated_at=NOW()`, [crypto.randomUUID(), organizationId, userId, ALIENISTA_SLUG]);
    await client.query(`INSERT INTO entitlements(id,user_id,work_slug,source,status) VALUES($1,$2,$3,$4,'active')
      ON CONFLICT (user_id,work_slug) DO UPDATE SET source=EXCLUDED.source,status='active',expires_at=NULL
      WHERE entitlements.status <> 'active'`, [crypto.randomUUID(), userId, ALIENISTA_SLUG, `school:${organizationId}`]);
  });
  await recordCrmEvent({ type: "license_assigned", organizationId, userId, relatedType: "work", relatedId: ALIENISTA_SLUG });
  done("/backoffice/crm", "organizacoes");
}

export async function revokeLicense(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id"), userId = field(form, "user_id");
  if (!organizationId || !userId) throw new Error("Licença inválida");
  await transaction(async client => {
    await client.query("SELECT 1 FROM license_pools WHERE organization_id=$1 AND work_slug=$2 FOR UPDATE", [organizationId, ALIENISTA_SLUG]);
    await client.query("UPDATE license_assignments SET status='revoked',updated_at=NOW() WHERE organization_id=$1 AND user_id=$2 AND work_slug=$3", [organizationId, userId, ALIENISTA_SLUG]);
    const alternate = await client.query<{ organization_id: string }>("SELECT organization_id FROM license_assignments WHERE user_id=$1 AND work_slug=$2 AND status='active' ORDER BY created_at LIMIT 1", [userId, ALIENISTA_SLUG]);
    await client.query("UPDATE entitlements SET status=$1,source=$2 WHERE user_id=$3 AND work_slug=$4 AND source=$5", [alternate.rows[0] ? "active" : "revoked", alternate.rows[0] ? `school:${alternate.rows[0].organization_id}` : `school:${organizationId}`, userId, ALIENISTA_SLUG, `school:${organizationId}`]);
  });
  await recordCrmEvent({ type: "license_revoked", organizationId, userId, relatedType: "work", relatedId: ALIENISTA_SLUG });
  done("/backoffice/crm", "organizacoes");
}

export async function createReferral(form: FormData) {
  await admin();
  const leadId = field(form, "lead_id");
  const lead = await query("SELECT 1 FROM partner_leads WHERE id=$1", [leadId]);
  if (!lead.rowCount) throw new Error("Contato não encontrado");
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  await query(`INSERT INTO partner_referrals(id,lead_id,code) VALUES($1,$2,$3)
    ON CONFLICT (lead_id) DO NOTHING`, [crypto.randomUUID(), leadId, code]);
  await recordCrmEvent({ type: "referral_created", relatedType: "partner_lead", relatedId: leadId });
  done("/backoffice/parcerias");
}

export async function createOpportunity(form: FormData) {
  await admin();
  const organizationId = field(form, "organization_id") || null;
  const leadId = field(form, "lead_id") || null;
  const title = field(form, "title"), model = field(form, "model");
  const potential = Number(field(form, "potential"));
  if ((!organizationId && !leadId) || !title || !["to_define", "pilot", "referral", "recurring", "fixed"].includes(model) || !Number.isFinite(potential) || potential < 0 || potential > 1000000) throw new Error("Oportunidade inválida");
  const id = crypto.randomUUID();
  await query(`INSERT INTO crm_opportunities(id,organization_id,lead_id,title,model,potential_cents,notes)
    VALUES($1,$2,$3,$4,$5,$6,$7)`, [id, organizationId, leadId, title, model, Math.round(potential * 100), field(form, "notes", 1000)]);
  await recordCrmEvent({ type: "opportunity_created", organizationId, relatedType: "opportunity", relatedId: id });
  done("/backoffice/parcerias");
}

export async function updateOpportunity(form: FormData) {
  await admin();
  const id = field(form, "id"), stage = field(form, "stage");
  if (!id || !["idea", "conversation", "proposal", "agreed", "closed"].includes(stage)) throw new Error("Etapa inválida");
  await query("UPDATE crm_opportunities SET stage=$1,updated_at=NOW() WHERE id=$2", [stage, id]);
  await recordCrmEvent({ type: "opportunity_stage_changed", relatedType: "opportunity", relatedId: id, metadata: { stage } });
  done("/backoffice/parcerias");
}
