import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {getMember,ensureAlienistaEntitlement} from '@/lib/member';
import {audioDirectory} from '@/lib/work-audio';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{sceneId:string}>}){
 const user=await getMember();if(!user)return new Response('',{status:401});if(!await ensureAlienistaEntitlement(user.userId))return new Response('',{status:403});
 const {sceneId}=await params;if(!/^s(?:[0-9]|[1-3][0-9]|4[0-7])$/.test(sceneId))return new Response('',{status:404});
 try{const audio=await readFile(path.join(audioDirectory(),'o-alienista',`${sceneId}.mp3`));return new Response(new Uint8Array(audio),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, no-store'}});}catch{return new Response('',{status:404});}
}
