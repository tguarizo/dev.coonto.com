import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TeacherWorkspace } from "@/components/teacher-workspace";
import { getAccessProfile } from "@/lib/access-control";

export const dynamic = "force-dynamic";
type ClassRow={classroom_id:string;classroom_name:string;organization_name:string;students:string};

export default async function Professor() {
  const user = await requireUser("/professor");
  const access=await getAccessProfile(user);
  if(!access.canUseEducationalCrm || (!access.globalOperation&&!access.personas.includes("educator"))){
    return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">ACESSO EDUCADOR</span><h1>Este espaço é para educadores verificados.</h1><p>Sua conta de leitura continua funcionando normalmente. Quando um vínculo de professor for aprovado, este mesmo login libera preparação de obras, turmas e acompanhamento pedagógico.</p><a className="button button-primary" href="/minha-biblioteca">Ir para minha biblioteca</a></section></div><SiteFooter/></main>;
  }
  await query("INSERT INTO teacher_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING",[user.userId]);
  const classes=access.globalOperation
    ? await query<ClassRow>("SELECT c.id AS classroom_id,c.name AS classroom_name,o.name AS organization_name,COUNT(e.user_id)::text AS students FROM classrooms c JOIN organizations o ON o.id=c.organization_id LEFT JOIN classroom_enrollments e ON e.classroom_id=c.id GROUP BY c.id,c.name,o.name ORDER BY o.name,c.name")
    : await query<ClassRow>("SELECT c.id AS classroom_id,c.name AS classroom_name,o.name AS organization_name,COUNT(e.user_id)::text AS students FROM classroom_teachers t JOIN classrooms c ON c.id=t.classroom_id JOIN organizations o ON o.id=t.organization_id LEFT JOIN classroom_enrollments e ON e.classroom_id=c.id WHERE t.user_id=$1 GROUP BY c.id,c.name,o.name ORDER BY o.name,c.name",[user.userId]);
  return <main className="page"><SiteHeader/><div className="content member-page">
    <section className="page-hero"><span className="section-kicker">ESPAÇO DO PROFESSOR</span><h1>Prepare a obra. Depois acompanhe sua turma.</h1><p>Seu acesso Educador é separado da leitura pessoal. Você pode preparar a experiência e, quando houver vínculo institucional, ver somente as turmas às quais está associado.</p></section>
    {classes.rows.length>0&&<section className="dashboard-card"><h2>Minhas turmas</h2><div className="status-list">{classes.rows.map(row=><div className="status-item" key={row.classroom_id}><div><strong>{row.classroom_name}</strong><p>{row.organization_name} · {row.students} aluno(s)</p></div><a href={`/gestao-escolar?turma=${row.classroom_id}`}>Acompanhar →</a></div>)}</div></section>}
    <TeacherWorkspace/>
  </div><SiteFooter/></main>;
}
