// O proxy preserva Host e informa o protocolo público; request.url pode usar o host interno do Next.
export function sameRequestOrigin(request:Request){
 const origin=request.headers.get('origin');if(!origin)return true;
 try{const parsed=new URL(origin),url=new URL(request.url);const host=request.headers.get('host')||url.host;const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0].trim()||url.protocol.slice(0,-1);return parsed.origin===origin&&parsed.host.toLowerCase()===host.toLowerCase()&&['http','https'].includes(protocol)&&parsed.protocol===protocol+':';}catch{return false;}
}
