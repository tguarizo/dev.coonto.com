import {loginArtData} from '@/lib/login-art';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 try{
  const art=await loginArtData((await params).id);
  if(!art)return new Response(null,{status:404});
  return new Response(new Uint8Array(art.bytes),{headers:{'Content-Type':art.type,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response(null,{status:503});}
}
