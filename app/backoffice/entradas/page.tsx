import { requireCrmHost } from "@/lib/admin-host";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { updateEntryStatus } from "./actions";

export const dynamic = "force-dynamic";

type Entry = { id: string; kind: string; title: string; detail: string; email: string | null; status: string; created_at: Date };
const types: Record<string, string> = { all: "Todos", survey: "Pesquisa", partners: "Parcerias", feedback: "Comentários", suggestions: "Sugestões de obras" };

export default async function Inbox({ searchParams }: { searchParams: Promise<{ tipo?: string; busca?: string; salvo?: string }> }) {
  await requireCrmHost();
  const user = await requireUser("/backoffice/entradas");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1></div></main>;
  const params = await searchParams;
  const kind = Object.hasOwn(types, params.tipo || "") ? params.tipo! : "all";
  const search = (params.busca || "").trim().slice(0, 120);
  const records = await query<Entry>(`
    WITH entries AS (
      SELECT id,'survey'::text AS kind,COALESCE(answers->>'role','Pesquisa respondida') AS title,
        COALESCE(answers->>'problem','') AS detail,NULLIF(answers->>'contact','') AS email,
        'received'::text AS status,created_at FROM survey_responses
      UNION ALL SELECT id,'partners',name || ' · ' || role,message,email,status,created_at FROM partner_leads
      UNION ALL SELECT id,'feedback','Nota ' || rating::text || '/5 · ' || source,message,email,status,created_at FROM feedback
      UNION ALL SELECT id,'suggestions',title || COALESCE(' · ' || author,''),reason,email,status,created_at FROM work_suggestions
    )
    SELECT * FROM entries WHERE ($1::text='all' OR kind=$1)
      AND ($2::text='' OR title ILIKE '%' || $2 || '%' OR detail ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%')
    ORDER BY created_at DESC LIMIT 100`, [kind, search]);
  return <main className="backoffice"><SiteHeader/><div className="content crm-page">
    <section className="backoffice-hero"><span className="section-kicker">CRM · FORMULÁRIOS DO SITE</span><h1>Caixa de entrada</h1><p>Pesquisa, parcerias, comentários e sugestões num só lugar. Busque por nome, assunto, mensagem ou contato. Mostramos até 100 resultados recentes por busca.</p>{params.salvo === "1" && <p role="status">Etapa salva.</p>}</section>
    <form method="get" className="dashboard-card crm-search" role="search"><label className="field">Área<select name="tipo" defaultValue={kind}>{Object.entries(types).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field">Buscar<input name="busca" type="search" defaultValue={search} maxLength={120} placeholder="Nome, e-mail ou palavra"/></label><button className="button button-primary">Pesquisar</button>{(search || kind !== "all") && <a href="/backoffice/entradas">Limpar filtros</a>}</form>
    <div className="crm-entry-list">{records.rows.length ? records.rows.map(entry => <article className="dashboard-card crm-entry" key={`${entry.kind}-${entry.id}`}><div className="crm-entry-head"><strong>{entry.title}</strong><span className="status-pill">{types[entry.kind]} · {entry.status === "new" ? "Novo" : entry.status === "reviewed" ? "Revisado" : entry.status === "archived" ? "Arquivado" : entry.status === "received" ? "Recebido" : entry.status}</span></div><p>{entry.detail || "Sem comentário adicional."}</p><p className="crm-entry-meta">{new Date(entry.created_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}{entry.email && <> · {entry.email.includes("@") ? <a href={`mailto:${entry.email}`}>{entry.email}</a> : entry.email}</>}</p>{entry.kind === "feedback" || entry.kind === "suggestions" ? <form action={updateEntryStatus}><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="kind" value={entry.kind}/><label className="field">Etapa<select name="status" defaultValue={entry.status}><option value="new">Novo</option><option value="reviewed">Revisado</option><option value="archived">Arquivado</option></select></label><button className="button button-primary">Salvar</button></form> : <a href={entry.kind === "survey" ? `/backoffice/pesquisa?id=${encodeURIComponent(entry.id)}` : `/backoffice/crm?area=relacionamentos&busca=${encodeURIComponent(entry.email || entry.title)}`}>Abrir registro detalhado →</a>}</article>) : <section className="dashboard-card"><p>Nenhuma entrada encontrada com estes filtros.</p></section>}</div>
  </div></main>;
}
