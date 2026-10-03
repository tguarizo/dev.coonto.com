import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getAccessProfile } from '@/lib/access-control';
import { educationContexts } from '@/lib/education-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { isCrmHost } from '@/lib/admin-host';
export const dynamic='force-dynamic';
export default async function Ambientes(){
 const user=await requireUser('/ambientes');
 if(await isCrmHost())redirect('/backoffice');
 const access=await getAccessProfile(user),contexts=await educationContexts(user.userId);
 const teaching=access.personas.includes('educator');
 if(!teaching&&!contexts.length&&!access.canUseCommercialCrm&&!access.canUseCulturalCrm)redirect('/minha-biblioteca');
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO · MEUS AMBIENTES</span><h1>Onde você quer trabalhar?</h1><p>Seu acesso depende dos vínculos autorizados. Cada instituição tem seu próprio contexto.</p></section>
 <section className="dashboard-card"><h2>Coonto Leitura</h2><p>Sua biblioteca e suas anotações pessoais.</p><a className="button button-primary" href="/minha-biblioteca">Abrir biblioteca</a><a className="button" href="/atividades">Minhas atividades</a></section>
 {teaching&&<section className="dashboard-card"><h2>Coonto Professor</h2><p>Preparação das aulas e marcações pessoais.</p><a className="button button-primary" href="/professor">Preparar aula</a></section>}
 {contexts.map(context=><section className="dashboard-card" key={context.id}><span className="section-kicker">{context.role==='manager'?'COONTO ESCOLA':'COONTO PROFESSOR'}</span><h2>{context.name}</h2><p>{context.role==='manager'?'Gestão da instituição':'Turmas atribuídas a você'}</p><a className="button button-primary" href={`/gestao-escolar?instituicao=${encodeURIComponent(context.id)}`}>Abrir instituição</a></section>)}
 {access.canUseCommercialCrm&&<section className="dashboard-card"><h2>Parceiro comercial</h2><a href="/parceiro-comercial">Abrir ambiente</a></section>}
 {access.canUseCulturalCrm&&<section className="dashboard-card"><h2>Curadoria</h2><a href="/curadoria">Abrir ambiente</a></section>}
 </div><SiteFooter/></main>;
}
