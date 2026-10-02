import {freeWorks} from "@/lib/free-works";
import { BookOpen, Cloud, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { DeviceManager } from "@/components/device-manager";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { query } from "@/lib/db";
import { ALIENISTA_SLUG, ensureAlienistaEntitlement } from "@/lib/member";
import { getAccessProfile } from "@/lib/access-control";

export const dynamic="force-dynamic";
export default async function MinhaBiblioteca() {
  const user=await requireUser("/minha-biblioteca");const profile=await getAccessProfile(user);const access=await ensureAlienistaEntitlement(user.userId);
  const [progressResult,deviceResult]=await Promise.all([
    query<{percent:number;completed:boolean}>("SELECT percent,completed FROM learning_progress WHERE user_id=$1 AND work_slug=$2 LIMIT 1",[user.userId,ALIENISTA_SLUG]),
    query<{id:string;label:string;last_seen_at:string}>("SELECT id,label,last_seen_at FROM member_devices WHERE user_id=$1 AND revoked=FALSE ORDER BY last_seen_at DESC",[user.userId]),
  ]);const progress=progressResult.rows[0];
  const rc=await query<{work_slug:string;percent:number}>("SELECT work_slug,percent FROM rc_learning_progress WHERE user_id=$1",[user.userId]);
  const available=await query<{work_slug:string}>("SELECT work_slug FROM entitlements WHERE user_id=$1 AND status='active' AND (expires_at IS NULL OR expires_at>NOW())",[user.userId]);
  return <main className="page"><SiteHeader/><div className="content member-page">
    <section className="member-welcome"><span className="section-kicker">MINHA CONTA COONTO</span><h1>Olá, {user.displayName.split(" ")[0]||user.email.split("@")[0]}.</h1><p>Sua leitura pessoal, seu progresso e os aparelhos autorizados ficam juntos aqui.</p>
    {(profile.canUseEducationalCrm||profile.canUseCommercialCrm||profile.canUseCulturalCrm)&&<div className="after-actions">{profile.personas.includes("educator")&&<a className="button button-outline" href="/professor">Espaço do professor</a>}{profile.canUseEducationalCrm&&<a className="button button-outline" href="/gestao-escolar">Gestão educacional</a>}{profile.canUseCommercialCrm&&<a className="button button-outline" href="/parceiro-comercial">Parceiro comercial</a>}{profile.canUseCulturalCrm&&<a className="button button-outline" href="/curadoria">Curadoria</a>}</div>}</section>
    <section className="dashboard-card"><span className="section-kicker">CONTINUAR · CONCLUÍDAS · EXPLORAR</span><h2>Sua biblioteca acompanha o seu momento.</h2><p>Você pode pausar uma obra, começar outra e voltar depois. Cada experiência conserva o próprio progresso.</p></section>
    <h2>{progress?.completed?"Concluídas":"Continuar"}</h2><section className="member-grid"><article className="library-work"><div className="library-cover"><span>MACHADO DE ASSIS</span><strong>O Alienista</strong><small>Primeira experiência Coonto</small></div><div className="library-copy">
      <span className="status-pill">{access?"ACESSO ATIVO":"PEDIDO GRATUITO DISPONÍVEL"}</span><h2>{access?(progress?(progress.completed?"Experiência concluída":"Continue de onde parou"):"Sua primeira experiência está pronta"):"Adicione O Alienista à biblioteca"}</h2>
      <p>{access?(progress?(String(progress.percent)+"% da jornada percorrida. Seu histórico está sincronizado entre os aparelhos autorizados."):"Entre em Itaguaí, decida, descubra e compreenda a obra por dentro."):"Faça um pedido de R$ 0,00, sem cartão e sem assinatura. Depois, a experiência ficará disponível nesta conta."}</p>
      {access&&<div className="member-progress"><span style={{width:String(progress?.percent??0)+"%"}}/></div>}<a className="button button-primary" href={access?"/leitura/o-alienista":"/checkout/o-alienista"}><BookOpen size={18}/>{access?(progress?"Continuar experiência":"Começar agora"):"Concluir pedido gratuito"}</a>
    </div></article><aside className="account-side"><section><h2><Cloud size={20}/> Histórico sincronizado</h2><p>Suas decisões e seu ponto de leitura acompanham sua conta.</p></section><section><h2><ShieldCheck size={20}/> Uso offline protegido</h2><p>Após adicionar a obra, autorize até dois aparelhos. A licença fica disponível por 30 dias antes de renovar o acesso.</p>{access&&<DeviceManager initialDevices={deviceResult.rows.map(device=>({id:device.id,label:device.label,lastSeenAt:String(device.last_seen_at)}))}/>}</section></aside></section>
    <section className="dashboard-card"><h2>Escolha sua próxima experiência gratuita</h2><p>As três obras desta beta podem entrar na sua biblioteca por R$ 0,00. Dentro da leitura, use “Baixar neste aparelho”.</p><div className="rc-catalog-grid">{freeWorks.filter(work=>work.slug!=='o-alienista').map(work=>{const hasAccess=available.rows.some(r=>r.work_slug===work.slug);return <article key={work.slug}><h3>{work.title}</h3><p>{work.author} · {work.detail}</p><p>{rc.rows.find(r=>r.work_slug===work.slug)?.percent??0}% das etapas visitadas</p><a className="button button-primary" href={hasAccess?work.href:'/checkout/'+work.slug}>{hasAccess?'Continuar experiência':'Adicionar gratuitamente'}</a></article>;})}</div><h2>Em preparação</h2><p>Dom Casmurro · Machado de Assis.</p></section>

  </div><SiteFooter/></main>;
}
