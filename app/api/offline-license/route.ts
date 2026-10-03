import type {query} from '@/lib/db';
import {ensureWorkEntitlement,getMember} from '@/lib/member';
import {freeWork} from '@/lib/free-works';
import {sameRequestOrigin} from '@/lib/request-origin';
import {transaction} from '@/lib/transaction';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!sameRequestOrigin(request))return Response.json({error:'Origem inválida'},{status:403});
 const member=await getMember();if(!member)return Response.json({error:'Entre para continuar'},{status:401});
 let body:Record<string,unknown>;try{body=await request.json();}catch{return Response.json({error:'Pedido inválido'},{status:400});}
 const slug=String(body.workSlug||'o-alienista');if(!freeWork(slug))return Response.json({error:'Obra inválida'},{status:400});
 const entitlement=await ensureWorkEntitlement(member.userId,slug);
 if(!entitlement)return Response.json({error:'Conclua o pedido gratuito desta obra'},{status:403});
 const clientDeviceId=String(body.deviceId||'').trim().slice(0,128),label=String(body.label||'Este aparelho').trim().slice(0,80);if(clientDeviceId.length<8)return Response.json({error:'Aparelho inválido'},{status:400});
 const limit=Math.max(1,Math.min(10,Number(process.env.MAX_USER_DEVICES)||2)),days=Math.max(1,Math.min(90,Number(process.env.OFFLINE_LICENSE_DAYS)||30)),expiresAt=new Date(Math.min(Date.now()+days*86400000,entitlement.expires_at?new Date(entitlement.expires_at).getTime():Infinity)).toISOString();
 return transaction(async client=>{
  await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[member.userId]);
  const known=await client.query<{id:string;revoked:boolean}>('SELECT id,revoked FROM member_devices WHERE user_id=$1 AND client_device_id=$2 LIMIT 1',[member.userId,clientDeviceId]);
  let deviceId=known.rows[0]?.id;
  if(!deviceId||known.rows[0]?.revoked){const active=await client.query<{count:string}>('SELECT COUNT(*)::text AS count FROM member_devices WHERE user_id=$1 AND revoked=FALSE',[member.userId]);if(Number(active.rows[0]?.count||0)>=limit)return Response.json({error:`Sua conta já possui ${limit} aparelhos ativos.`},{status:409});if(!deviceId)deviceId=crypto.randomUUID();}
  const fresh=await ensureWorkEntitlement(member.userId,slug,'activate',client.query.bind(client) as typeof query);
  if(!fresh)return Response.json({error:'A licença não está mais vigente.'},{status:403});
  await client.query('INSERT INTO member_devices(id,user_id,client_device_id,label) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,client_device_id) DO UPDATE SET label=EXCLUDED.label,revoked=FALSE,last_seen_at=NOW()',[deviceId,member.userId,clientDeviceId,label]);
  await client.query("INSERT INTO offline_licenses(id,user_id,work_slug,device_id,expires_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,work_slug,device_id) DO UPDATE SET status='active',expires_at=EXCLUDED.expires_at",[crypto.randomUUID(),member.userId,slug,deviceId,expiresAt]);
  return Response.json({ok:true,expiresAt,deviceLimit:limit},{headers:{'Cache-Control':'private, no-store'}});
 });
}
