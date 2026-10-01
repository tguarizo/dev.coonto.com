import {readFile} from "node:fs/promises";
import path from "node:path";
import {audioDirectory} from "@/lib/work-audio";

export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!/^(?:alienista|dom-casmurro|divina-comedia)$/.test(id))return new Response("",{status:404});
  try{
    const audio=await readFile(path.join(audioDirectory(),"home-examples",id+".mp3"));
    return new Response(new Uint8Array(audio),{headers:{"Content-Type":"audio/mpeg","Cache-Control":"public, max-age=86400"}});
  }catch{return new Response("",{status:404});}
}
