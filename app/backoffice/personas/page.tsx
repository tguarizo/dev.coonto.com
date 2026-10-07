import "../crm/styles.css";
import {requireCrmHost} from "@/lib/admin-host";
import {requireUser} from "@/lib/auth";
import {getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";
import {SiteHeader} from "@/components/site-header";
import {setCommercialScope,setCuratorWork,setPersona} from "./actions";

export const dynamic="force-dynamic";
const personaLabels:Record<string,string>={reader:"Leitor",educator:"Educador",school_admin:"Gestor escolar",commercial_partner:"Parceiro comercial",cultural_partner:"Parceiro cultural / curador",owner:"Owner",developer:"Desenvolvedor"};
type Row={id:string;name:string;contact:string;personas:string[]|null};
type Lead={id:string;name:string;organization:string|null};
type Org={id:string;name:string};
const curatorWorks=[{slug:"o-alienista",title:"O Alienista"},{slug:"memorias-de-martha",title:"Memórias de Martha"},{slug:"divina-comedia-canto-i",title:"Dante · Inferno, Canto I"}];
type Permission={user_id:string;work_slug:string;can_comment:boolean;can_approve:boolean;can_publish:boolean};
type Scope={partner_user_id:string;lead_id:string|null;organization_id:string|null};

export default async function Personas(){
 await requireCrmHost();const user=await requireUser("/backoffice/personas");const access=await getAccessProfile(user);
 if(!access.globalOperation)return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1></div></main>;
 const [users,leads,orgs,scopes,permissions]=await Promise.all([
  query<Row>("SELECT u.id,u.name,COALESCE(u.email,u.phone,'') AS contact,ARRAY_REMOVE(ARRAY_AGG(p.persona) FILTER (WHERE p.status='active'),NULL) AS personas FROM users u LEFT JOIN user_personas p ON p.user_id=u.id GROUP BY u.id,u.name,u.email,u.phone ORDER BY u.last_seen_at DESC LIMIT 150"),
  query<Lead>("SELECT id,name,organization FROM partner_leads ORDER BY created_at DESC LIMIT 100"),
  query<Org>("SELECT id,name FROM organizations WHERE status='active' ORDER BY name"),
  query<Scope>("SELECT partner_user_id,lead_id,organization_id FROM commercial_partner_assignments"),
  query<Permission>("SELECT user_id,work_slug,can_comment,can_approve,can_publish FROM curator_work_permissions")
 ]);
 return <main className="backoffice"><SiteHeader/><div className="content crm-page"><section className="backoffice-hero"><span className="section-kicker">PERSONAS E ACESSOS</span><h1>Uma pessoa. Vários vínculos. Permissões separadas.</h1><p>Personas globais não substituem vínculos com escolas. Owner é administração global; Developer continua técnico e não recebe automaticamente permissões de negócio.</p></section>
 <div className="status-list">{users.rows.map(row=><article className="dashboard-card" key={row.id}><h2>{row.name}</h2><p>{row.contact}</p><div className="crm-form-grid">{Object.entries(personaLabels).map(([persona,label])=>{const active=row.personas?.includes(persona)??false;return <form action={setPersona} key={persona} className="crm-inline-form"><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="persona" value={persona}/><input type="hidden" name="enabled" value={active?"0":"1"}/><span>{label}</span><button className={"button "+(active?"button-outline":"button-primary")}>{active?"Revogar":"Ativar"}</button></form>})}</div>
 {row.personas?.includes("commercial_partner")&&<div className="form-card"><h3>Escopo comercial atribuído</h3><form action={setCommercialScope} className="crm-inline-form"><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="kind" value="lead"/><input type="hidden" name="enabled" value="1"/><select name="target_id" required defaultValue=""><option value="" disabled>Selecionar contato</option>{leads.rows.filter(l=>!scopes.rows.some(s=>s.partner_user_id===row.id&&s.lead_id===l.id)).map(l=><option key={l.id} value={l.id}>{l.name}{l.organization?" · "+l.organization:""}</option>)}</select><button className="button button-primary">Atribuir contato</button></form><form action={setCommercialScope} className="crm-inline-form"><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="kind" value="organization"/><input type="hidden" name="enabled" value="1"/><select name="target_id" required defaultValue=""><option value="" disabled>Selecionar organização</option>{orgs.rows.filter(o=>!scopes.rows.some(s=>s.partner_user_id===row.id&&s.organization_id===o.id)).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><button className="button button-primary">Atribuir organização</button></form>{scopes.rows.filter(s=>s.partner_user_id===row.id).map(s=><form key={(s.lead_id||"")+"-"+(s.organization_id||"")} action={setCommercialScope} className="crm-inline-form"><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="kind" value={s.lead_id?"lead":"organization"}/><input type="hidden" name="target_id" value={s.lead_id||s.organization_id||""}/><input type="hidden" name="enabled" value="0"/><span>{s.lead_id?("Contato: "+(leads.rows.find(l=>l.id===s.lead_id)?.name||s.lead_id)):("Organização: "+(orgs.rows.find(o=>o.id===s.organization_id)?.name||s.organization_id))}</span><button className="button button-outline">Remover</button></form>)}</div>}{row.personas?.includes("cultural_partner")&&curatorWorks.map(work=>{const permission=permissions.rows.find(p=>p.user_id===row.id&&p.work_slug===work.slug);return <form action={setCuratorWork} className="form-card" key={work.slug}><h3>Curadoria · {work.title}</h3><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="work_slug" value={work.slug}/><fieldset className="crm-checks"><legend>Permissões desta obra</legend><label><input type="checkbox" name="can_comment" defaultChecked={permission?.can_comment??false}/> Comentar e editar</label><label><input type="checkbox" name="can_approve" defaultChecked={permission?.can_approve??false}/> Aprovar</label><label><input type="checkbox" name="can_publish" defaultChecked={permission?.can_publish??false}/> Publicar</label></fieldset><button className="button button-primary">Salvar permissões</button></form>})}
 </article>)}</div></div></main>;
}
