import {requireUser} from "@/lib/auth";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {culturalScope,getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";
import {addCuratorComment} from "./actions";

export const dynamic="force-dynamic";
type Comment={id:string;work_slug:string;scene_id:string;body:string;created_at:string;name:string};

export default async function Curadoria(){
 const user=await requireUser("/curadoria");const access=await getAccessProfile(user);
 if(!access.canUseCulturalCrm)return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Curadoria restrita</h1><p>O Coonto precisa atribuir uma obra ao seu perfil cultural.</p></div><SiteFooter/></main>;
 const permissions=access.globalOperation?["o-alienista","memorias-de-martha","divina-comedia-canto-i"].map(work_slug=>({work_slug,can_comment:true,can_approve:true,can_publish:true})):await culturalScope(user.userId);
 const works=permissions.map(p=>p.work_slug);
 const comments=works.length?await query<Comment>("SELECT c.id,c.work_slug,c.scene_id,c.body,c.created_at,u.name FROM curator_scene_comments c JOIN users u ON u.id=c.user_id WHERE c.work_slug=ANY($1::text[]) ORDER BY c.created_at DESC LIMIT 100",[works]):{rows:[] as Comment[]};
 return <main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">PARCEIRO CULTURAL · CURADORIA</span><h1>Revise a obra sem abrir o negócio inteiro.</h1><p>Comentários, aprovação e publicação são permissões separadas. Informações financeiras não aparecem nesta área.</p></section>
 <section className="dashboard-card"><h2>Obras atribuídas</h2><p><a className="button button-outline" href="/curadoria/rc">Editar e publicar Beta RC</a></p><div className="status-list">{permissions.map(p=><div className="status-item" key={p.work_slug}><div><strong>{p.work_slug}</strong><p>Comentar: {p.can_comment?"sim":"não"} · Aprovar: {p.can_approve?"sim":"não"} · Publicar: {p.can_publish?"sim":"não"}</p></div></div>)}</div></section>
 {permissions.some(p=>p.can_comment)&&<section className="dashboard-card"><h2>Novo comentário por cena</h2><form action={addCuratorComment} className="form-card"><label className="field">Obra<select name="work_slug">{permissions.filter(p=>p.can_comment).map(p=><option key={p.work_slug}>{p.work_slug}</option>)}</select></label><label className="field">Cena<input name="scene_id" placeholder="s12" required maxLength={40}/></label><label className="field">Comentário<textarea name="body" required maxLength={4000}/></label><button className="button button-primary">Registrar comentário</button></form></section>}
 <section className="dashboard-card"><h2>Comentários recentes</h2><div className="status-list">{comments.rows.length?comments.rows.map(c=><div className="status-item" key={c.id}><div><strong>{c.work_slug} · {c.scene_id}</strong><p>{c.body}</p><small>{c.name}</small></div></div>):<p>Nenhum comentário ainda.</p>}</div></section>
 </div><SiteFooter/></main>;
}
