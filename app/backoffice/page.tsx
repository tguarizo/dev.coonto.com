import "./crm/styles.css";
import { requireUser } from "@/lib/auth";
import { requireCrmHost } from "@/lib/admin-host";
import { SiteHeader } from "@/components/site-header";
import { query } from "@/lib/db";
import { formatBRL, getCommercialSettings } from "@/lib/commercial";
import { saveCommercialSettings } from "./actions";
import { publishedWorks } from "@/lib/catalog-works";

export const dynamic = "force-dynamic";
export default async function Backoffice() {
  await requireCrmHost();
  const user = await requireUser("/backoffice");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1><p>Sua conta não possui acesso administrativo.</p></div></main>;
  const [counts, prices] = await Promise.all([
    query<{members:string;starts:string;completed:string;feedbacks:string;partners:string;suggestions:string;surveys:string}>(`SELECT (SELECT COUNT(*) FROM users)::text AS members,((SELECT COUNT(*) FROM learning_progress)+(SELECT COUNT(*) FROM rc_learning_progress))::text AS starts,(SELECT COUNT(*) FROM learning_progress WHERE completed=TRUE)::text AS completed,(SELECT COUNT(*) FROM feedback)::text AS feedbacks,(SELECT COUNT(*) FROM partner_leads)::text AS partners,(SELECT COUNT(*) FROM work_suggestions)::text AS suggestions,(SELECT COUNT(*) FROM survey_responses)::text AS surveys`),
    getCommercialSettings(),
  ]);
  const c = counts.rows[0];
  const metrics = [["Membros cadastrados",c.members],["Históricos registrados · três experiências",c.starts],["Chegaram ao fim · O Alienista",c.completed],["Respostas da pesquisa",c.surveys]];
  return <main className="backoffice"><SiteHeader/><div className="content"><section className="backoffice-hero"><span className="section-kicker">BACKOFFICE · VALIDAÇÃO</span><h1>O que chegou ao Coonto</h1><p>Feedbacks: <strong>{c.feedbacks}</strong>. Parceiros interessados: <strong>{c.partners}</strong>. Sugestões de obras: <strong>{c.suggestions}</strong>.</p><div className="crm-inline-form"><a className="button button-primary" href="/backoffice/entradas">Abrir caixa de entrada →</a><a className="button button-primary" href="/backoffice/crm?area=relacionamentos">Ver contatos →</a></div></section><section className="metrics">{metrics.map(([label,value])=><div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section><section className="dashboard-grid"><article className="dashboard-card" id="ofertas"><h2>Ofertas de referência</h2><p>Preços de referência e obra gratuita atual. Alterar aqui não ativa cobranças.</p><form action={saveCommercialSettings} className="form-card"><div className="field"><label htmlFor="single-price">Obra individual (R$)</label><input id="single-price" name="single_price" type="number" min="0" max="10000" step="0.01" defaultValue={(prices.single_price_cents/100).toFixed(2)} required /></div><div className="field"><label htmlFor="club-price">Coonto Club por mês (R$)</label><input id="club-price" name="club_price" type="number" min="0" max="10000" step="0.01" defaultValue={(prices.club_price_cents/100).toFixed(2)} required /></div><div className="field"><label htmlFor="free-work">Obra gratuita em destaque</label><select id="free-work" name="free_work_slug" defaultValue={prices.freeWork.slug}>{publishedWorks.map(work => <option key={work.slug} value={work.slug}>{work.title}</option>)}</select><small>Somente obras publicadas podem ser selecionadas. Este campo configura apenas o destaque legado de O Alienista; as três experiências estão gratuitas nesta beta.</small></div><button type="submit" className="button button-primary">Salvar ofertas</button></form><p>Atualmente: {formatBRL(prices.single_price_cents)} por obra e {formatBRL(prices.club_price_cents)}/mês.</p></article><article className="dashboard-card"><h2>Catálogo inicial</h2><p><strong>O Alienista</strong> está disponível para validação. <strong>Memórias de Martha</strong> e <strong>Inferno, Canto I</strong> estão disponíveis em revisão editorial. Dom Casmurro aparece apenas como demonstração na home. O Club depende de revisão editorial, validação com usuários e definição das condições comerciais. Etapas visitadas e chegada ao fim não comprovam aprendizagem.</p><p>O preço mostrado é uma referência; a integração de pagamentos segue desativada.</p></article></section></div></main>;
}
