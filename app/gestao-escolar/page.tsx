import {EducationSidebar} from '@/components/education-sidebar';
import {requireEducationVerification} from '@/lib/education-session';
import { notFound,redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { educationContexts,selectEducationContext,contextClassrooms } from '@/lib/education-context';
import { staffActivities,staffSubmissions } from '@/lib/educational-activities';
import { publishActivity,sendFeedback } from './actions';
import '../backoffice/crm/styles.css';
export const dynamic='force-dynamic';
export default async function GestaoEscolar({searchParams}:{searchParams:Promise<{instituicao?:string;turma?:string;atividade?:string;resultado?:string}>}){
 const user=await requireUser('/gestao-escolar'),params=await searchParams,contexts=await educationContexts(user.userId);
 const context=selectEducationContext(contexts,params.instituicao);
 if(!context){if(params.instituicao!==undefined)notFound();redirect('/ambientes');}
 if(context.role==='manager')requireEducationVerification(user,'/gestao-escolar?instituicao='+encodeURIComponent(context.id));
 const classes=await contextClassrooms(user.userId,context);
 const requested=params.turma===undefined?undefined:classes.rows.find(c=>c.id===params.turma);
 if(params.turma!==undefined&&!requested)notFound();
 const activities=await staffActivities(user.userId,context.id,requested?.id);
 if(params.atividade!==undefined&&!activities.rows.some(a=>a.id===params.atividade))notFound();
 const submissions=params.atividade?await staffSubmissions(user.userId,context.id,params.atividade):{rows:[]};
 const base=`/gestao-escolar?instituicao=${encodeURIComponent(context.id)}`;
 return <div className="crm-workspace"><EducationSidebar name={context.name} environment={context.role==='manager'?'Escola':'Professor'} home={base} licenses={context.role==='manager'?'/licencas-institucionais?instituicao='+encodeURIComponent(context.id):undefined}/>
 <div className="crm-workspace-main"><main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO {context.role==='manager'?'ESCOLA':'PROFESSOR'}</span><h1>{context.name}{requested?` · ${requested.name}`:''}</h1><p>{context.role==='manager'?'Gestão da instituição':'Suas turmas atribuídas'}. As entregas abaixo são atividades institucionais. A leitura e as anotações pessoais não são consultadas neste painel.</p></section>
 {params.resultado&&<p role="status">{params.resultado==='publicado'?'Atividade publicada.':params.resultado==='devolutiva'?'Devolutiva enviada.':'Não foi possível concluir. Confira o vínculo e os dados informados.'}</p>}
 <section className="dashboard-card"><h2>Turmas autorizadas</h2><div className="status-list">{classes.rows.map(c=><div className="status-item" key={c.id}><div><strong>{c.name}</strong><p>{c.students} matrícula(s) · {c.teachers} professor(es) atribuído(s)</p></div><a href={`${base}&turma=${encodeURIComponent(c.id)}`}>Ver atividades</a></div>)}{!classes.rows.length&&<p>Nenhuma turma atribuída neste contexto.</p>}</div></section>
 {!!classes.rows.length&&<section className="dashboard-card"><h2>Publicar atividade</h2><form action={publishActivity}><input type="hidden" name="organization" value={context.id}/><label className="field">Turma<select name="classroom" required defaultValue={requested?.id}>{classes.rows.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label className="field">Título<input name="title" required minLength={2} maxLength={160}/></label><label className="field">Orientações<textarea name="instructions" required minLength={2} maxLength={8000}/></label><button className="button button-primary" type="submit">Publicar para a turma</button></form></section>}
 <section className="dashboard-card"><h2>Atividades institucionais</h2>{activities.rows.map(a=><div className="status-item" key={a.id}><div><strong>{a.title}</strong><p>{a.submitted} entrega(s) · {a.reviewed} devolutiva(s). Estes números não medem aprendizagem.</p></div><a href={`${base}&atividade=${encodeURIComponent(a.id)}`}>Ver entregas</a></div>)}{!activities.rows.length&&<p>Nenhuma atividade publicada.</p>}</section>
 {params.atividade&&<section className="dashboard-card"><h2>Entregas e devolutivas</h2>{submissions.rows.map(s=><article key={s.student_id}><h3>{s.name}</h3><p style={{whiteSpace:'pre-wrap'}}>{s.body}</p><form action={sendFeedback}><input type="hidden" name="organization" value={context.id}/><input type="hidden" name="activity" value={params.atividade}/><input type="hidden" name="student" value={s.student_id}/><label className="field">Devolutiva<textarea name="feedback" required maxLength={8000} defaultValue={s.feedback??''}/></label><button className="button button-primary" type="submit">Enviar devolutiva</button></form></article>)}{!submissions.rows.length&&<p>Ainda não há entregas.</p>}</section>}
 </div><SiteFooter/></main></div></div>;
}
