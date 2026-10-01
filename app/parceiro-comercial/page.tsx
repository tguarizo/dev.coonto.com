import {requireUser} from "@/lib/auth";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {commercialScope,getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";

export const dynamic="force-dynamic";
type Lead={id:string;name:string;email:string;organization:string|null;status:string};
type Opportunity={id:string;title:string;stage:string;potential_cents:number};

export default async function ParceiroComercial(){
 const user=await requireUser("/parceiro-comercial");const access=await getAccessProfile(user);
 if(!access.canUseCommercialCrm)return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área de parceiro restrita</h1><p>Este acesso precisa ser atribuído pelo Coonto.</p></div><SiteFooter/></main>;
 const scope=access.globalOperation?null:await commercialScope(user.userId);
 const leads=access.globalOperation
  ? await query<Lead>("SELECT id,name,email,organization,status FROM partner_leads ORDER BY created_at DESC LIMIT 100")
  : await query<Lead>("SELECT id,name,email,organization,status FROM partner_leads WHERE id=ANY($1::text[]) ORDER BY created_at DESC",[scope!.leadIds]);
 const opportunities=access.globalOperation
  ? await query<Opportunity>("SELECT id,title,stage,potential_cents FROM crm_opportunities ORDER BY updated_at DESC LIMIT 100")
  : await query<Opportunity>("SELECT o.id,o.title,o.stage,o.potential_cents FROM crm_opportunities o WHERE o.lead_id=ANY($1::text[]) OR o.organization_id=ANY($2::text[]) ORDER BY o.updated_at DESC",[scope!.leadIds,scope!.organizationIds]);
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">PARCEIRO COMERCIAL</span><h1>Seus relacionamentos Coonto.</h1><p>Esta área mostra somente contatos, oportunidades e valores atribuídos a você. Atividades individuais de alunos não fazem parte desta visão.</p></section>
 <section className="dashboard-card"><h2>Contatos atribuídos</h2><div className="status-list">{leads.rows.length?leads.rows.map(l=><div className="status-item" key={l.id}><div><strong>{l.name}</strong><p>{l.email}{l.organization?" · "+l.organization:""}</p></div><span>{l.status}</span></div>):<p>Nenhum contato atribuído.</p>}</div></section>
 <section className="dashboard-card"><h2>Oportunidades</h2><div className="status-list">{opportunities.rows.length?opportunities.rows.map(o=><div className="status-item" key={o.id}><div><strong>{o.title}</strong><p>Etapa: {o.stage}</p></div><span>{(o.potential_cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span></div>):<p>Nenhuma oportunidade atribuída.</p>}</div></section>
 </div><SiteFooter/></main>;
}
