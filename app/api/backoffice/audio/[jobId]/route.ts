import {isCrmHost} from '@/lib/admin-host';
import {getCurrentUser} from '@/lib/auth';
import {readAudioDraft} from '@/lib/audio-production';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{jobId:string}>}){
 if(!await isCrmHost())return new Response('',{status:404});const user=await getCurrentUser();if(!user||user.role!=='admin')return new Response('',{status:403});
 const {jobId}=await params;if(!/^[a-f0-9-]{36}$/.test(jobId))return new Response('',{status:404});
 try{const audio=await readAudioDraft(jobId);if(!audio)return new Response('',{status:404});return new Response(new Uint8Array(audio),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, no-store'}});}catch{return new Response('',{status:404});}
}
