import {readdir} from 'node:fs/promises';
import path from 'node:path';
import {getMember,ensureAlienistaEntitlement} from '@/lib/member';
import {audioDirectory} from '@/lib/work-audio';
export const dynamic='force-dynamic';
export async function GET(){const user=await getMember();if(!user||!await ensureAlienistaEntitlement(user.userId))return Response.json({error:'Entre para continuar'},{status:401});let names:string[]=[];try{names=await readdir(path.join(audioDirectory(),'o-alienista'));}catch{}return Response.json({scenes:names.filter(name=>/^s(?:[0-9]|[1-3][0-9]|4[0-7])\.mp3$/.test(name)).map(name=>name.slice(0,-4))},{headers:{'Cache-Control':'no-store'}});}
