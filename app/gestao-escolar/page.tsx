import {requireUser} from "@/lib/auth";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";

export const dynamic="force-dynamic";
type Org={id:string;name:string;role:string};
type Class={id:string;organization_id:string;name:string;students:string;teachers:string};
type Student={id:string;organization_id:string;name:string;contact:string;percent:number|null;completed:boolean|null};

export default async function GestaoEscolar({searchParams}:{searchParams:Promise<{turma?:string}>}){
 const user=await requireUser("/gestao-escolar");const access=await getAccessProfile(user);
 const orgs=access.globalOperation
  ? await query<Org>("SELECT id,name,'owner'::text AS role FROM organizations WHERE status='active' ORDER BY name")
  : await query<Org>("SELECT o.id,o.name,m.role FROM organization_memberships m JOIN organizations o ON o.id=m.organization_id WHERE m.user_id=$1 AND m.role IN ('manager','teacher') AND o.status='active' ORDER BY o.name",[user.userId]);
 if(!access.canUseEducationalCrm||!orgs.rows.length)return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área educacional restrita</h1><p>Você precisa estar vinculado como professor ou gestor de uma instituição.</p></div><SiteFooter/></main>;
 const ids=orgs.rows.map(o=>o.id);
 const classes=await query<Class>("SELECT c.id,c.organization_id,c.name,COUNT(DISTINCT e.user_id)::text AS students,COUNT(DISTINCT t.user_id)::text AS teachers FROM classrooms c LEFT JOIN classroom_enrollments e ON e.classroom_id=c.id LEFT JOIN classroom_teachers t ON t.classroom_id=c.id WHERE c.organization_id=ANY($1::text[]) AND ($2::boolean OR EXISTS(SELECT 1 FROM organization_memberships m WHERE m.organization_id=c.organization_id AND m.user_id=$3 AND m.role='manager') OR EXISTS(SELECT 1 FROM classroom_teachers ct WHERE ct.classroom_id=c.id AND ct.user_id=$3)) GROUP BY c.id,c.organization_id,c.name ORDER BY c.name",[ids,access.globalOperation,user.userId]);
 const params=await searchParams;const requested=classes.rows.find(c=>c.id===params.turma);
 const classIds=requested?[requested.id]:classes.rows.map(c=>c.id);
 const students=classIds.length?await query<Student>("SELECT u.id,e.organization_id,u.name,COALESCE(u.email,u.phone,'') AS contact,p.percent,p.completed FROM classroom_enrollments e JOIN users u ON u.id=e.user_id LEFT JOIN learning_progress p ON p.user_id=u.id AND p.work_slug='o-alienista' WHERE e.classroom_id=ANY($1::text[]) ORDER BY u.name",[classIds]):{rows:[] as Student[]};
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">GESTÃO EDUCACIONAL</span><h1>{requested?requested.name:"Minhas escolas e turmas"}</h1><p>Esta visão é limitada às instituições e turmas do seu vínculo. Notas pessoais do aluno permanecem privadas.</p></section>
 <section className="dashboard-card"><h2>Contextos</h2><div className="status-list">{orgs.rows.map(o=><div className="status-item" key={o.id}><strong>{o.name}</strong><span>{o.role==="manager"?"Gestor":o.role==="teacher"?"Professor":"Owner"}</span></div>)}</div></section>
 <section className="dashboard-card"><h2>Turmas</h2><div className="status-list">{classes.rows.map(c=><div className="status-item" key={c.id}><div><strong>{c.name}</strong><p>{c.students} aluno(s) · {c.teachers} professor(es)</p></div><a href={`/gestao-escolar?turma=${c.id}`}>Ver alunos →</a></div>)}</div></section>
 <section className="dashboard-card"><h2>{requested?"Evolução da turma":"Alunos das minhas turmas"}</h2><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Aluno</th><th>Contato</th><th>O Alienista</th><th>Situação</th></tr></thead><tbody>{students.rows.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.contact}</td><td>{s.percent??0}%</td><td>{s.completed?"Concluída":s.percent?"Em andamento":"Não iniciada"}</td></tr>)}</tbody></table></div></section>
 </div><SiteFooter/></main>;
}
