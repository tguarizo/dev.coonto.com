import {z} from 'zod';
import {sameRequestOrigin} from '@/lib/request-origin';
import {getCurrentUser} from '@/lib/auth';
import {culturalScope,getAccessProfile} from '@/lib/access-control';
import {getPool,query} from '@/lib/db';
import {rcDefaults,validateRcEdition} from '@/lib/rc-content';
import {rcSlugSchema,rcSlugs} from '@/lib/rc-schema';
export const dynamic='force-dynamic';
async function permission(){const user=await getCurrentUser();if(!user)return null;const profile=await getAccessProfile(user);if(!profile.canUseCulturalCrm)return null;const works=profile.globalOperation?rcSlugs.map(work_slug=>({work_slug,can_comment:true,can_approve:true,can_publish:true})):await culturalScope(user.userId);return {user,works:works.filter(p=>rcSlugSchema.safeParse(p.work_slug).success)};}
export async function GET(){const access=await permission();if(!access)return Response.json({error:'Acesso restrito'},{status:403});const slugs=access.works.map(p=>p.work_slug);const rows=await query("SELECT id,work_slug,status,content,created_at,approved_at,published_at FROM rc_content_versions WHERE work_slug=ANY($1::text[]) ORDER BY created_at DESC LIMIT 100",[slugs]);return Response.json({permissions:access.works,defaults:slugs.map(s=>rcDefaults[s]),versions:rows.rows},{headers:{'Cache-Control':'private, no-store'}});}
const operation=z.discriminatedUnion('action',[z.object({action:z.literal('draft'),slug:rcSlugSchema,content:z.unknown()}).strict(),z.object({action:z.enum(['approve','publish']),id:z.string().uuid()}).strict()]);
export async function POST(request:Request){
 if(!sameRequestOrigin(request))return Response.json({error:'Origem inválida'},{status:403});
 const access=await permission();if(!access)return Response.json({error:'Acesso restrito'},{status:403});
 const raw=await request.text();if(raw.length>150000)return Response.json({error:'Conteúdo excede o limite'},{status:413});let input;try{input=operation.parse(JSON.parse(raw));}catch{return Response.json({error:'Operação inválida'},{status:400});}
 if(input.action==='draft'){
  if(!access.works.some(p=>p.work_slug===input.slug&&p.can_comment))return Response.json({error:'Sem permissão para editar esta obra'},{status:403});
  let content;try{content=validateRcEdition(input.content,input.slug);}catch(error){return Response.json({error:error instanceof Error?error.message:'Conteúdo inválido'},{status:400});}
  const id=crypto.randomUUID();await query("INSERT INTO rc_content_versions(id,work_slug,content,created_by) VALUES($1,$2,$3::jsonb,$4)",[id,input.slug,JSON.stringify(content),access.user.userId]);return Response.json({ok:true,id});
 }
 const client=await getPool().connect();try{
  await client.query('BEGIN');const found=await client.query<{work_slug:string}>("SELECT work_slug FROM rc_content_versions WHERE id=$1",[input.id]);const slug=found.rows[0]?.work_slug;
  const allowed=access.works.find(p=>p.work_slug===slug);if(!allowed||(input.action==='approve'?!allowed.can_approve:!allowed.can_publish)){await client.query('ROLLBACK');return Response.json({error:'Sem permissão para esta versão'},{status:403});}
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['rc-publish:'+slug]);
  const rows=await client.query<{status:string;content:unknown}>("SELECT status,content FROM rc_content_versions WHERE id=$1 FOR UPDATE",[input.id]);const row=rows.rows[0];
  if(!row||row.status!==(input.action==='approve'?'draft':'approved')){await client.query('ROLLBACK');return Response.json({error:'Aprovação exige rascunho; publicação exige versão aprovada.'},{status:409});}
  validateRcEdition(row.content,slug);
  if(input.action==='approve')await client.query("UPDATE rc_content_versions SET status='approved',approved_by=$2,approved_at=NOW() WHERE id=$1",[input.id,access.user.userId]);
  else{await client.query("UPDATE rc_content_versions SET status='archived' WHERE work_slug=$1 AND status='published'",[slug]);await client.query("UPDATE rc_content_versions SET status='published',published_by=$2,published_at=NOW() WHERE id=$1",[input.id,access.user.userId]);}
  await client.query('COMMIT');return Response.json({ok:true});
 }catch{await client.query('ROLLBACK');return Response.json({error:'Não foi possível concluir a operação. Nenhuma publicação parcial foi aplicada.'},{status:500});}finally{client.release();}
}
