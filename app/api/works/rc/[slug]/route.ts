import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {getCurrentUser} from '@/lib/auth';
import {ensureWorkEntitlement} from '@/lib/member';
import {getRcWork} from '@/lib/rc-content';
import {prepareRcState,initialRcState,rcSlugSchema,rcStateSchema,validRcState} from '@/lib/rc-schema';
import {query} from '@/lib/db';
import {rcOfflineHtml} from '@/lib/rc-offline';
import verses from '@/content/inferno-i-verses.json';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!rcSlugSchema.safeParse(slug).success)return new Response('',{status:404});
 const user=await getCurrentUser();if(!user)return new Response('Entre na sua conta.',{status:401});
 if(!await ensureWorkEntitlement(user.userId,slug))return new Response('Adicione esta obra à biblioteca.',{status:403});
 const work=await getRcWork(slug),saved=await query<{state_json:unknown;revision:number;content_version:string}>('SELECT state_json,revision,content_version FROM rc_learning_progress WHERE user_id=$1 AND work_slug=$2',[user.userId,slug]);
 const row=saved.rows[0],parsed=rcStateSchema.safeParse(row?.state_json),state=parsed.success&&validRcState(parsed.data,work)?parsed.data:initialRcState;
 const css=await readFile(path.join(process.cwd(),'public','rc-reader.css'),'utf8');
 const html=rcOfflineHtml({work,state:prepareRcState(state,work),revision:row?.revision||0,userId:user.userId,verses},css);
 if(!await ensureWorkEntitlement(user.userId,slug,'used'))return new Response('Acesso indisponível.',{status:403});
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Coonto-User':user.userId,'Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; frame-ancestors 'self'",'X-Content-Type-Options':'nosniff'}});
}
