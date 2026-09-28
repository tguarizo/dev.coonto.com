import { requireUser } from "@/lib/auth";
import { requireCrmHost } from "@/lib/admin-host";
import { query } from "@/lib/db";
import { surveyLabels } from "@/lib/survey";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

type SurveyRow = { id: string; survey_version: string; answers: Record<string, string | string[]>; created_at: Date };
type Distribution = { answer: string; total: string };

async function distribution(key: string) {
  return query<Distribution>(`SELECT answers->>$1 AS answer, COUNT(*)::text AS total FROM survey_responses GROUP BY answers->>$1 ORDER BY COUNT(*) DESC`, [key]);
}

export default async function SurveyResults({ searchParams }: { searchParams: Promise<{ pagina?: string; id?: string }> }) {
  await requireCrmHost();
  const user = await requireUser("/backoffice/pesquisa");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1><p>Sua conta não possui acesso administrativo.</p></div></main>;
  const params = await searchParams;
  const requested = Number(params.pagina || 1);
  const page = Number.isInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const selectedId = /^[0-9a-f-]{36}$/i.test(params.id || "") ? params.id! : "";
  const perPage = 30;
  const [totalResult, records, understanding, difficulty, adoption, payer] = await Promise.all([
    query<{ total: string }>("SELECT COUNT(*)::text AS total FROM survey_responses"),
    query<SurveyRow>("SELECT id,survey_version,answers,created_at FROM survey_responses WHERE ($1::text='' OR id=$1) ORDER BY created_at DESC LIMIT $2 OFFSET $3", [selectedId, perPage, selectedId ? 0 : (page - 1) * perPage]),
    distribution("understood"), distribution("difficulty"), distribution("adoption"), distribution("payer"),
  ]);
  const total = Number(totalResult.rows[0]?.total || 0);
  const summaries = [["Compreensão", understanding.rows], ["Facilidade", difficulty.rows], ["Adoção docente", adoption.rows], ["Quem paga", payer.rows]] as const;
  return <main className="backoffice"><SiteHeader/><div className="content survey-results">
    <a href="/backoffice" className="survey-back">← Voltar ao backoffice</a>
    <div className="backoffice-hero"><span className="section-kicker">BACKOFFICE · PESQUISA V1.6</span><h1>Respostas do questionário</h1><p><strong>{total}</strong> resposta{total === 1 ? "" : "s"} recebida{total === 1 ? "" : "s"}. Somente administradores podem acessar esta página.</p>{selectedId && <a href="/backoffice/pesquisa">Ver todas as respostas →</a>}</div>
    <div className="survey-summary-grid">{summaries.map(([title, rows]) => <section className="dashboard-card" key={title}><h2>{title}</h2>{rows.length ? <ul>{rows.map(row => <li key={row.answer ?? "none"}><span>{row.answer || "Sem resposta"}</span><strong>{row.total}</strong></li>)}</ul> : <p>Ainda sem respostas.</p>}</section>)}</div>
    <section className="survey-response-list"><h2>Respostas individuais</h2>{records.rows.length ? records.rows.map((record) => <details className="survey-response" key={record.id}><summary><strong>{new Date(record.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</strong><span>{record.answers.role} · {record.answers.understood}</span></summary><dl>{Object.entries(surveyLabels).map(([key, label]) => {
      const value = record.answers[key];
      if (!value || (Array.isArray(value) && !value.length)) return null;
      return <div key={key}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join("; ") : value}</dd></div>;
    })}</dl>{["role_other", "helpful_other", "trust_other", "obstacle_other"].some(key => record.answers[key]) && <p><strong>Outras respostas:</strong> {["role_other", "helpful_other", "trust_other", "obstacle_other"].filter(key => record.answers[key]).map(key => String(record.answers[key])).join("; ")}</p>}</details>) : <p>Ainda não há respostas para mostrar.</p>}</section>
    {!selectedId && <nav className="survey-pagination" aria-label="Páginas de respostas">{page > 1 && <a href={`/backoffice/pesquisa?pagina=${page - 1}`}>← Anteriores</a>}<span>Página {page}</span>{page * perPage < total && <a href={`/backoffice/pesquisa?pagina=${page + 1}`}>Próximas →</a>}</nav>}
  </div></main>;
}
