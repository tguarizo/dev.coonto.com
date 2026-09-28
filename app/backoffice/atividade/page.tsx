import "../crm/styles.css";
import { requireCrmHost } from "@/lib/admin-host";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  login_succeeded: "Entrada", free_order_completed: "Pedido gratuito", work_started: "Leitura iniciada",
  work_completed: "Leitura concluída", partner_lead_received: "Contato recebido",
  lead_stage_changed: "Etapa do contato", organization_created: "Conta criada",
  student_enrolled: "Aluno na turma", teacher_assigned: "Professor na turma",
  license_assigned: "Licença atribuída", license_revoked: "Licença revogada",
  survey_submitted: "Pesquisa respondida",
  classroom_member_removed: "Vínculo com turma removido",
  referral_created: "Link de indicação", opportunity_created: "Oportunidade criada",
  opportunity_stage_changed: "Etapa da oportunidade",
  admin_granted: "Acesso administrativo concedido", admin_revoked: "Acesso administrativo retirado",
};
type Event = { id: string; event_type: string; name: string | null; organization: string | null; related_type: string | null; related_id: string | null; created_at: Date };

export default async function Activity({ searchParams }: { searchParams: Promise<{ conta?: string; tipo?: string }> }) {
  await requireCrmHost();
  const user = await requireUser("/backoffice/atividade");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1></div></main>;
  const params = await searchParams;
  const organizationId = params.conta || "";
  const type = labels[params.tipo || ""] ? params.tipo || "" : "";
  const [organizations, events, totals] = await Promise.all([
    query<{ id: string; name: string }>("SELECT id,name FROM organizations ORDER BY name"),
    query<Event>(`SELECT e.id,e.event_type,u.name,o.name AS organization,e.related_type,e.related_id,e.created_at
      FROM crm_events e LEFT JOIN users u ON u.id=e.user_id LEFT JOIN organizations o ON o.id=e.organization_id
      WHERE ($1::text='' OR e.organization_id=$1 OR EXISTS(
        SELECT 1 FROM crm_event_organizations eo WHERE eo.event_id=e.id AND eo.organization_id=$1))
        AND ($2::text='' OR e.event_type=$2)
      ORDER BY e.created_at DESC LIMIT 100`, [organizationId, type]),
    query<{ event_type: string; total: string }>(`SELECT event_type,COUNT(*)::text AS total FROM crm_events
      WHERE created_at >= NOW()-INTERVAL '30 days' AND ($1::text='' OR organization_id=$1 OR EXISTS(
        SELECT 1 FROM crm_event_organizations eo WHERE eo.event_id=crm_events.id AND eo.organization_id=$1))
      GROUP BY event_type ORDER BY COUNT(*) DESC`, [organizationId]),
  ]);
  return <main className="backoffice"><SiteHeader/><div className="content crm-page">
    <a className="survey-back" href="/backoffice">← Painel administrativo</a>
    <section className="backoffice-hero"><span className="section-kicker">CRM · HISTÓRICO</span><h1>O que aconteceu no Coonto</h1><p>Movimentos relevantes, organizados por conta e período. Respostas anteriores à ativação deste histórico não aparecem retroativamente.</p></section>
    <form className="form-card crm-inline-form" method="get"><label className="field">Conta<select name="conta" defaultValue={organizationId}><option value="">Todas</option>{organizations.rows.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label><label className="field">Evento<select name="tipo" defaultValue={type}><option value="">Todos</option>{Object.entries(labels).map(([key,value]) => <option key={key} value={key}>{value}</option>)}</select></label><button className="button button-primary">Filtrar</button></form>
    <section className="dashboard-card"><h2>Últimos 30 dias</h2>{totals.rows.length ? <div className="crm-summary">{totals.rows.map(row => <span key={row.event_type}><strong>{row.total}</strong> {labels[row.event_type] || row.event_type}</span>)}</div> : <p>Ainda não há eventos neste período.</p>}</section>
    <section className="dashboard-card"><h2>Até 100 eventos recentes</h2>{events.rows.length ? <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Quando</th><th>Evento</th><th>Pessoa</th><th>Conta</th><th>Referência</th></tr></thead><tbody>{events.rows.map(event => <tr key={event.id}><td>{new Date(event.created_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</td><td>{labels[event.event_type] || event.event_type}</td><td>{event.name || "—"}</td><td>{event.organization || "—"}</td><td>{event.related_type || "—"}{event.related_id && <> · {event.related_id.slice(0,12)}</>}</td></tr>)}</tbody></table></div> : <p>Nenhum evento com esses filtros.</p>}</section>
  </div></main>;
}
