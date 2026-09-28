import { requireCrmHost } from "@/lib/admin-host";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { GrantAdministratorForm, RevokeAdministratorForm } from "@/components/administrator-access-forms";

export const dynamic = "force-dynamic";
type Administrator = { id: string; email: string; name: string; has_logged_in: boolean };

export default async function Administrators() {
  await requireCrmHost();
  const user = await requireUser("/backoffice/administradores");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1><p>Sua conta não possui acesso administrativo.</p></div></main>;
  const result = await query<Administrator>(`SELECT u.id,u.email,u.name,EXISTS(SELECT 1 FROM sessions s WHERE s.user_id=u.id) AS has_logged_in
    FROM users u WHERE u.role='admin' ORDER BY u.email`);
  const fixed = String(process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return <main className="backoffice"><SiteHeader/><div className="content crm-page">
    <section className="backoffice-hero"><span className="section-kicker">CRM · ACESSO</span><h1>Administradores</h1><p>Conceda acesso pelo e-mail. A pessoa receberá o código quando entrar no CRM e poderá ver todas as áreas e informações administrativas.</p></section>
    <section className="dashboard-card"><h2>Adicionar pessoa</h2><GrantAdministratorForm/><p>Ela não precisa ter uma conta antes. Use o endereço <a href="/login?return_to=%2Fbackoffice">crm.dev.coonto.com/login</a> para o primeiro acesso.</p></section>
    <section className="dashboard-card"><h2>Quem tem acesso</h2><div className="status-list">{result.rows.map(person => <div className="status-item" key={person.id}><div><strong>{person.email}</strong><p>{fixed.includes(person.email) ? "Acesso definido no servidor" : person.has_logged_in ? "Já entrou no Coonto" : "Aguardando primeiro acesso"}{person.id === user.userId ? " · Você" : ""}</p></div>{person.id !== user.userId && !fixed.includes(person.email) && <RevokeAdministratorForm id={person.id}/>}</div>)}</div></section>
  </div></main>;
}
