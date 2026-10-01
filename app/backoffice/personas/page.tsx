import "../crm/styles.css";
import {requireCrmHost} from "@/lib/admin-host";
import {requireUser} from "@/lib/auth";
import {getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";
import {SiteHeader} from "@/components/site-header";
import {setCuratorWork,setPersona} from "./actions";

export const dynamic="force-dynamic";
const personaLabels:Record<string,string>={reader:"Leitor",educator:"Educador",school_admin:"Gestor escolar",commercial_partner:"Parceiro comercial",cultural_partner:"Parceiro cultural / curador",owner:"Owner",developer:"Desenvolvedor"};
type Row={id:string;name:string;contact:string;personas:string[]|null};

export default async function Personas(){
 await requireCrmHost();const user=await requireUser("/backoffice/personas");const access=await getAccessProfile(user);
 if(!access.globalOperation)return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1></div></main>;
 const users=await query<Row>("SELECT u.id,u.name,COALESCE(u.email,u.phone,'') AS contact,ARRAY_REMOVE(ARRAY_AGG(p.persona) FILTER (WHERE p.status='active'),NULL) AS personas FROM users u LEFT JOIN user_personas p ON p.user_id=u.id GROUP BY u.id,u.name,u.email,u.phone ORDER BY u.last_seen_at DESC LIMIT 150");
 return <main className="backoffice"><SiteHeader/><div className="content crm-page"><section className="backoffice-hero"><span className="section-kicker">PERSONAS E ACESSOS</span><h1>Uma pessoa. Vários vínculos. Permissões separadas.</h1><p>Personas globais não substituem vínculos com escolas. Owner é administração global; Developer continua técnico e não recebe automaticamente permissões de negócio.</p></section>
 <div className="status-list">{users.rows.map(row=><article className="dashboard-card" key={row.id}><h2>{row.name}</h2><p>{row.contact}</p><div className="crm-form-grid">{Object.entries(personaLabels).map(([persona,label])=>{const active=row.personas?.includes(persona)??false;return <form action={setPersona} key={persona} className="crm-inline-form"><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="persona" value={persona}/><input type="hidden" name="enabled" value={active?"0":"1"}/><span>{label}</span><button className={"button "+(active?"button-outline":"button-primary")}>{active?"Revogar":"Ativar"}</button></form>})}</div>
 {row.personas?.includes("cultural_partner")&&<form action={setCuratorWork} className="form-card"><h3>Permissões culturais · O Alienista</h3><input type="hidden" name="user_id" value={row.id}/><input type="hidden" name="work_slug" value="o-alienista"/><label><input type="checkbox" name="can_comment" defaultChecked/> Comentar</label><label><input type="checkbox" name="can_approve"/> Aprovar</label><label><input type="checkbox" name="can_publish"/> Publicar</label><button className="button button-primary">Salvar permissões</button></form>}
 </article>)}</div></div></main>;
}
