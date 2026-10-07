import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {audioDirectory} from '@/lib/work-audio';
import {voiceId} from '@/lib/audio-production';
import {rcSlugSchema} from '@/lib/rc-schema';
import {rcAudioEntries} from '@/scripts/rc-audio.cjs';
import {getRcWork} from '@/lib/rc-content';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{slug:string;unit:string}>}){
 const {slug,unit}=await params;if(!rcSlugSchema.safeParse(slug).success||! /^(?:(?:mov-[1-6]|cap-(?:[1-9]|1[0-2]))(?:-i-[1-3]-(?:pre|r-[0-2]))?)$/.test(unit))return new Response('',{status:404});
 const work=await getRcWork(slug),chapter=rcAudioEntries(work).find(u=>u.id===unit);if(!chapter)return new Response('',{status:404});
 const model=process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2',segments=[{speaker:'narrator',text:chapter.text,voiceId:voiceId('narrator')}];
 const expected=createHash('sha256').update(JSON.stringify({model,segments})).digest('hex');
 try{const manifest=JSON.parse(await readFile(path.join(audioDirectory(),'beta-audio-manifest.json'),'utf8'));if(manifest.items[slug+'/'+unit]?.hash!==expected)return new Response('',{status:404});const audio=await readFile(path.join(audioDirectory(),slug,unit+'.mp3'));
  const headers={'Content-Type':'audio/mpeg','Cache-Control':'public, max-age=0, must-revalidate','Accept-Ranges':'bytes'};
  const range=request.headers.get('range');if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response('',{status:416,headers:{'Content-Range':`bytes */${audio.length}`}});const start=match[1]?Number(match[1]):Math.max(0,audio.length-Number(match[2]));const end=match[1]&&match[2]?Math.min(Number(match[2]),audio.length-1):audio.length-1;if(start>=audio.length||end<start)return new Response('',{status:416,headers:{'Content-Range':`bytes */${audio.length}`}});return new Response(new Uint8Array(audio.subarray(start,end+1)),{status:206,headers:{...headers,'Content-Range':`bytes ${start}-${end}/${audio.length}`,'Content-Length':String(end-start+1)}});}
  return new Response(new Uint8Array(audio),{headers:{...headers,'Content-Length':String(audio.length)}});
 }catch{return new Response('',{status:404});}
}
