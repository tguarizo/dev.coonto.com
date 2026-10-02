import {z} from 'zod';
import {sameRequestOrigin} from '@/lib/request-origin';
import {getCurrentUser} from '@/lib/auth';
import {query} from '@/lib/db';
import {getRcWork} from '@/lib/rc-content';
import {rcSlugSchema,rcStateSchema,rcProgress,validRcState} from '@/lib/rc-schema';
export const dynamic='force-dynamic';
const input=z.object({state:rcStateSchema,revision:z.number().int().min(0).max(2147483646),contentVersion:z.string().max(80)}).strict();
type Context={params:Promise<{slug:string}>};
const privateHeaders={'Cache-Control':'private, no-store'};
export async function GET(_request:Request,{params}:Context){
 const slug=rcSlugSchema.safeParse((await params).slug);if(!slug.success)return Response.json({error:'Obra inválida'},{status:404});
 const user=await getCurrentUser();if(!user)return Response.json({error:'Entre para salvar na conta'},{status:401,headers:privateHeaders});
 const rows=await query<{state_json:unknown;revision:number;content_version:string}>("SELECT state_json,revision,content_version FROM rc_learning_progress WHERE user_id=$1 AND work_slug=$2",[user.userId,slug.data]);
 return Response.json({userId:user.userId,progress:rows.rows[0]?{state:rows.rows[0].state_json,revision:rows.rows[0].revision,contentVersion:rows.rows[0].content_version}:null},{headers:privateHeaders});
}
export async function POST(request:Request,{params}:Context){
 const slug=rcSlugSchema.safeParse((await params).slug);if(!slug.success)return Response.json({error:'Obra inválida'},{status:404});
 if(!sameRequestOrigin(request))return Response.json({error:'Origem inválida'},{status:403});
 const user=await getCurrentUser();if(!user)return Response.json({error:'Entre para salvar na conta'},{status:401,headers:privateHeaders});
 if(Number(request.headers.get('content-length'))>250000)return Response.json({error:'Anotações excedem o limite'},{status:413});
 const raw=await request.text();if(raw.length>250000)return Response.json({error:'Anotações excedem o limite'},{status:413});
 let body;try{body=input.parse(JSON.parse(raw));}catch{return Response.json({error:'Progresso inválido'},{status:400});}
 const work=await getRcWork(slug.data);if(body.contentVersion!==work.version)return Response.json({error:'A edição foi atualizada. Copie suas anotações e recarregue a página.'},{status:409});
 if(!validRcState(body.state,work.units.length))return Response.json({error:'Etapa inválida'},{status:400});
 const percent=rcProgress(body.state,work.units.length);
 const rows=await query<{revision:number}>(`INSERT INTO rc_learning_progress(user_id,work_slug,content_version,state_json,percent) SELECT $1,$2,$3,$4::jsonb,$5 WHERE $6=0
 ON CONFLICT(user_id,work_slug) DO UPDATE SET state_json=EXCLUDED.state_json,percent=EXCLUDED.percent,content_version=EXCLUDED.content_version,revision=rc_learning_progress.revision+1,updated_at=NOW() WHERE rc_learning_progress.revision=$6 RETURNING revision`,[user.userId,slug.data,body.contentVersion,JSON.stringify(body.state),percent,body.revision]);
 // Em revisões posteriores o SELECT não insere; atualizar somente a conta autenticada.
 if(!rows.rows.length&&body.revision>0){const updated=await query<{revision:number}>("UPDATE rc_learning_progress SET state_json=$3::jsonb,percent=$4,content_version=$5,revision=revision+1,updated_at=NOW() WHERE user_id=$1 AND work_slug=$2 AND revision=$6 RETURNING revision",[user.userId,slug.data,JSON.stringify(body.state),percent,body.contentVersion,body.revision]);if(updated.rows.length)return Response.json({ok:true,revision:updated.rows[0].revision,percent},{headers:privateHeaders});}
 if(!rows.rows.length)return Response.json({error:'Outra aba atualizou esta leitura. Copie suas anotações e recarregue para evitar sobrescrever o histórico.'},{status:409,headers:privateHeaders});
 return Response.json({ok:true,revision:rows.rows[0].revision,percent},{headers:privateHeaders});
}
