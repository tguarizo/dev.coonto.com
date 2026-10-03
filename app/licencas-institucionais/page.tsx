import {EducationSidebar} from '@/components/education-sidebar';
import {educationContexts} from '@/lib/education-context';
import '../backoffice/crm/styles.css';
import {notFound,redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {requireEducationVerification} from '@/lib/education-session';
import {schoolLicenseContext,schoolAllocations,schoolLicenseGrants,schoolLicenseStudents} from '@/lib/education-licenses';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {changeInstitutionalLicense} from './actions';
export const dynamic='force-dynamic';
export default async function InstitutionalLicenses({searchParams}:{searchParams:Promise<{instituicao?:string;resultado?:string}>}){
 const user=await requireUser('/licencas-institucionais'),params=await searchParams;
 if(!params.instituicao)redirect('/ambientes');
 requireEducationVerification(user,'/licencas-institucionais?instituicao='+encodeURIComponent(params.instituicao));
 const context=await schoolLicenseContext(user.userId,params.instituicao);if(!context)notFound();
 const allocations=await schoolAllocations(user.userId,params.instituicao);
 const students=await schoolLicenseStudents(user.userId,params.instituicao),grants=await schoolLicenseGrants(user.userId,params.instituicao);
 const schoolManager=(await educationContexts(user.userId)).some(c=>c.id===context.id&&c.role==='manager');
 return <div className="crm-workspace"><EducationSidebar name={context.name} environment={schoolManager?'Escola':'Rede'} home={schoolManager?'/gestao-escolar?instituicao='+encodeURIComponent(context.id):'/gestao-rede'} licenses={'/licencas-institucionais?instituicao='+encodeURIComponent(context.id)}/><div className="crm-workspace-main"><main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO · LICENÇAS INSTITUCIONAIS</span><h1>{context.name} · Licenças</h1><p>Esta autorização permite distribuir direitos de uso. Ela não concede acesso às respostas ou aos relatórios pedagógicos.</p><p>Uma revogação bloqueia novos acessos online. Cópias offline já autorizadas permanecem sujeitas ao prazo emitido e são revalidadas quando o aparelho volta a conectar.</p><a href="/ambientes?trocar=1">Trocar ambiente</a></section>
 {params.resultado&&<p role="status">{params.resultado==='salvo'?'Licença atualizada.':'Não foi possível atualizar. Confira as vagas e os vínculos vigentes.'}</p>}
 {!allocations.rows.length&&<p>Nenhuma reserva de licenças vigente para esta instituição.</p>}
 {allocations.rows.map(a=><section className="dashboard-card" key={a.contract_id}><h2>{a.reference} · {a.work_slug}</h2><p>{a.assigned}/{a.seats} licença(s) atribuída(s)</p><form action={changeInstitutionalLicense}><input type="hidden" name="school" value={params.instituicao}/><input type="hidden" name="contract" value={a.contract_id}/><input type="hidden" name="action" value="assign"/><label className="field">Aluno<select name="student" required><option value="">Selecione</option>{students.rows.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="button button-primary">Atribuir licença</button></form>{grants.rows.filter(g=>g.contract_id===a.contract_id&&g.status==='active').map(g=><div className="status-item" key={g.id}><strong>{g.name}</strong><form action={changeInstitutionalLicense}><input type="hidden" name="school" value={params.instituicao}/><input type="hidden" name="grant" value={g.id}/><input type="hidden" name="action" value="revoke"/><button className="button">Revogar licença</button></form></div>)}</section>)}
 </div><SiteFooter/></main></div></div>;
}
