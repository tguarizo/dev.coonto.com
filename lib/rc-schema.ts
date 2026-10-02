import {z} from 'zod';
export const rcSlugs=['memorias-de-martha','divina-comedia-canto-i'] as const;
export const rcSlugSchema=z.enum(rcSlugs);
const text=z.string().trim().min(1).max(6000);
export const rcWorkSchema=z.object({slug:rcSlugSchema,title:text,author:text,version:z.string().max(80),intro:text,source:z.object({label:text,href:z.string().url().refine(s=>s.startsWith('https://')),license:text,kind:z.enum(['pdf','verses'])}),units:z.array(z.object({id:z.string().regex(/^(cap|mov)-\d{1,2}$/),title:text,context:text,reading:text,question:text,options:z.array(z.object({label:text,consequence:text})).length(3),author:text,evidence:text,recall:text,connection:text,sourceStart:z.number().int().positive(),sourceEnd:z.number().int().positive()})).min(1).max(12)});
export type RcWork=z.infer<typeof rcWorkSchema>;
export const rcStages=['Contexto','Leitura','Decisão','Consequência','Autor','Interpretação','Recuperação','Conexão'];
const stepKey=z.string().regex(/^(?:0|[1-9]|1[01]):[0-7]$/);
export const rcStateSchema=z.object({unit:z.number().int().min(0).max(11),stage:z.number().int().min(0).max(7),visited:z.array(stepKey).max(96),answers:z.record(z.string().regex(/^(?:0|[1-9]|1[01])$/),z.number().int().min(0).max(2)),notes:z.record(stepKey,z.string().max(2000))}).strict();
export type RcState=z.infer<typeof rcStateSchema>;
export const initialRcState:RcState={unit:0,stage:0,visited:['0:0'],answers:{},notes:{}};
export function validRcState(state:RcState,count:number){return state.unit<count&&state.visited.every(k=>Number(k.split(':')[0])<count)&&Object.keys(state.notes).every(k=>Number(k.split(':')[0])<count)&&Object.keys(state.answers).every(k=>Number(k)<count);}
export function rcProgress(state:RcState,count:number){return Math.round(new Set(state.visited).size/(count*8)*100);}
