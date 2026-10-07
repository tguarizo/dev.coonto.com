import martha from '@/content/rc-memorias-de-martha.json';
import dante from '@/content/rc-divina-comedia-canto-i.json';
import {query} from '@/lib/db';
import {rcWorkSchema,type RcWork} from '@/lib/rc-schema';
export const rcDefaults:Record<string,RcWork>={'memorias-de-martha':rcWorkSchema.parse(martha),'divina-comedia-canto-i':rcWorkSchema.parse(dante)};
export async function getRcWork(slug:string){
 const fallback=rcDefaults[slug];if(!fallback)throw new Error('Obra inválida');
 if(!process.env.DATABASE_URL)return fallback;
 const rows=await query<{id:string;content:unknown}>("SELECT id,content FROM rc_content_versions WHERE work_slug=$1 AND status='published' LIMIT 1",[slug]);
 if(!rows.rows[0])return fallback;
 return {...rcWorkSchema.parse(rows.rows[0].content),version:rows.rows[0].id};
}
export function validateRcEdition(input:unknown,slug:string){
 const work=rcWorkSchema.parse(input);const base=rcDefaults[slug];
 if(!base||work.slug!==slug||work.source.kind!==base.source.kind||work.units.length!==base.units.length||work.units.some((u,i)=>u.id!==base.units[i].id||u.sourceStart!==base.units[i].sourceStart||u.sourceEnd!==base.units[i].sourceEnd))throw new Error('Preserve a obra, os capítulos e as faixas da fonte.');
 if(base.units.some(u=>u.interactions)&&work.units.some((u,i)=>JSON.stringify(u.interactions?.map(o=>({id:o.id,sourcePages:o.sourcePages})))!==JSON.stringify(base.units[i].interactions?.map(o=>({id:o.id,sourcePages:o.sourcePages})))))throw new Error('Preserve as interações e as referências ao original.');
 // Edição não pode mudar a fonte ou substituir os versos por conteúdo não auditado.
 if(work.source.href!==base.source.href||work.source.license!==base.source.license)throw new Error('A fonte e a licença devem ser preservadas.');
 return work;
}
