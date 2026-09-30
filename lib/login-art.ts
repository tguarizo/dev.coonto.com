import {readFile} from 'node:fs/promises';
import path from 'node:path';
const allowed=['phase1','phase2','phase3','phase4','phase5'];
let cached:Record<string,string>|undefined;
export function currentLoginArt(date=new Date()) {
 const list=(process.env.LOGIN_IMAGE_IDS||'phase1,phase2,phase3,phase4,phase5').split(',').map(s=>s.trim()).filter(s=>allowed.includes(s));
 const ids=list.length?list:allowed;
 const start=Date.parse(process.env.LOGIN_IMAGE_START||'2026-09-30T00:00:00-03:00');
 const baseline=Number.isFinite(start)?start:Date.parse('2026-09-30T00:00:00-03:00');
 const slot=Math.floor((date.getTime()-baseline)/(2*24*60*60*1000));
 return ids[((slot%ids.length)+ids.length)%ids.length];
}
export async function loginArtData(id:string) {
 if(!allowed.includes(id))return null;
 if(!cached){
  const html=await readFile(path.join(process.cwd(),'content','Coonto_O_Alienista.html'),'utf8');
  const match=html.match(/const IMG = (\{.*?\});/s);
  if(!match)throw new Error('login_art_unavailable');
  cached=JSON.parse(match[1]) as Record<string,string>;
 }
 const value=cached[id];const match=value?.match(/^data:image\/(webp|png);base64,(.+)$/s);
 return match?{type:`image/${match[1]}`,bytes:Buffer.from(match[2],'base64')}:null;
}
