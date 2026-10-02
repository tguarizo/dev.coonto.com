import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {audioDirectory} from '@/lib/work-audio';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(id!=='depois-da-aula')return new Response('',{status:404});
 let video:Buffer;try{video=await readFile(path.join(audioDirectory(),'videos','depois-da-aula.mp4'));}catch{return new Response('Vídeo em preparação.',{status:503});}
 const headers={'Content-Type':'video/mp4','Cache-Control':'public, max-age=0, must-revalidate','Accept-Ranges':'bytes'},range=request.headers.get('range');
 if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response('',{status:416,headers:{'Content-Range':`bytes */${video.length}`}});const start=match[1]?Number(match[1]):Math.max(0,video.length-Number(match[2])),end=match[1]&&match[2]?Math.min(Number(match[2]),video.length-1):video.length-1;if(start>=video.length||end<start)return new Response('',{status:416,headers:{'Content-Range':`bytes */${video.length}`}});return new Response(new Uint8Array(video.subarray(start,end+1)),{status:206,headers:{...headers,'Content-Range':`bytes ${start}-${end}/${video.length}`,'Content-Length':String(end-start+1)}});}
 return new Response(new Uint8Array(video),{headers:{...headers,'Content-Length':String(video.length)}});
}
