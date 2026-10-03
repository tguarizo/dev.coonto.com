import {cookies} from 'next/headers';
import {ContextChoice} from '@/components/context-choice';
import {contextDestinations,rememberedDestination} from '@/lib/navigation-context';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getAccessProfile } from '@/lib/access-control';
import {networkContexts} from '@/lib/education-network';
import { educationContexts } from '@/lib/education-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { isCrmHost } from '@/lib/admin-host';
export const dynamic='force-dynamic';
export default async function Ambientes({searchParams}:{searchParams:Promise<{trocar?:string}>}){
 const user=await requireUser('/ambientes');
 if(await isCrmHost())redirect('/backoffice');
 const access=await getAccessProfile(user),contexts=await educationContexts(user.userId),networks=await networkContexts(user.userId);
 const teaching=access.personas.includes('educator')||access.globalOperation;
 const params=await searchParams;if(params.trocar!=='1'){const preferred=rememberedDestination((await cookies()).get('coonto_context')?.value,user.userId,contextDestinations(access,contexts,networks));if(preferred)redirect(preferred);}
 if(!teaching&&!contexts.length&&!networks.length&&!access.canUseCommercialCrm&&!access.canUseCulturalCrm)redirect('/minha-biblioteca');
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO · MEUS AMBIENTES</span><h1>Onde você quer trabalhar?</h1><p>Seu acesso depende dos vínculos autorizados. Cada instituição tem seu próprio contexto.</p></section>
 <section className="dashboard-card"><h2>Coonto Leitura</h2><p>Sua biblioteca e suas anotações pessoais.</p><ContextChoice context="reader" label="Abrir biblioteca"/><a className="button" href="/atividades">Minhas atividades</a></section>
 {teaching&&<section className="dashboard-card"><h2>Coonto Professor</h2><p>Preparação das aulas e marcações pessoais.</p><ContextChoice context="teacher" label="Preparar aula"/></section>}
 {contexts.map(context=><section className="dashboard-card" key={context.id}><span className="section-kicker">{context.role==='manager'?'COONTO ESCOLA':'COONTO PROFESSOR'}</span><h2>{context.name}</h2><p>{context.role==='manager'?'Gestão da instituição':'Turmas atribuídas a você'}</p><ContextChoice context={"school:"+context.id} label="Abrir instituição"/></section>)}
 {networks.map(n=><section className="dashboard-card" key={n.id}><span className="section-kicker">COONTO REDE</span><h2>{n.name}</h2><p>{n.can_manage_licenses?'Licenças autorizadas':'Sem administração de licenças'} · {n.can_view_reports?'Relatórios autorizados':'Sem acesso pedagógico'}</p><ContextChoice context={"network:"+n.id} label="Abrir rede"/></section>)}
 {access.canUseCommercialCrm&&<section className="dashboard-card"><h2>Parceiro comercial</h2><ContextChoice context="commercial" label="Abrir ambiente"/></section>}
 {access.canUseCulturalCrm&&<section className="dashboard-card"><h2>Curadoria</h2><ContextChoice context="cultural" label="Abrir ambiente"/></section>}
 </div><SiteFooter/></main>;
}
