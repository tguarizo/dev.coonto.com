import { requireUser } from '@/lib/auth';
import { studentActivities } from '@/lib/educational-activities';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { sendSubmission } from './actions';
export const dynamic='force-dynamic';
export default async function Atividades({searchParams}:{searchParams:Promise<{resultado?:string}>}){
 const user=await requireUser('/atividades'),activities=await studentActivities(user.userId),params=await searchParams;
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO LEITURA</span><h1>Minhas atividades</h1><p>Ao enviar uma resposta, você a compartilha com os professores da turma e os gestores da instituição indicada. Suas anotações pessoais da biblioteca permanecem privadas.</p><a href="/ambientes?trocar=1">Meus ambientes</a></section>
 {params.resultado&&<p role="status">{params.resultado==='enviado'?'Resposta enviada.':'Não foi possível enviar. Confira seu vínculo e se a atividade está aberta.'}</p>}
 {!activities.rows.length&&<p>Nenhuma atividade disponível para seus vínculos atuais.</p>}
 {activities.rows.map(a=><section className="dashboard-card" key={a.id}><span className="section-kicker">{a.organization_name} · {a.classroom_name}</span><h2>{a.title}</h2><p style={{whiteSpace:'pre-wrap'}}>{a.instructions}</p>{a.feedback&&<div><h3>Devolutiva</h3><p style={{whiteSpace:'pre-wrap'}}>{a.feedback}</p></div>}
 {a.status==='open'?<form action={sendSubmission}><input type="hidden" name="activity" value={a.id}/><label className="field">Sua resposta<textarea name="body" required maxLength={12000} defaultValue={a.body??''}/></label><p>Uma nova entrega substitui a resposta anterior e aguarda nova devolutiva.</p><button className="button button-primary" type="submit">Enviar para {a.organization_name}</button></form>:<p>Atividade encerrada.</p>}</section>)}
 </div><SiteFooter/></main>;
}
