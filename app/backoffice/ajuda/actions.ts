"use server";
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requireCrmHost} from '@/lib/admin-host';
import {requireUser} from '@/lib/auth';
import {query} from '@/lib/db';
import {recordCrmEvent} from '@/lib/crm-events';
import {HELP_MODES,normalizeQuestion} from '@/lib/coonto-help';
import scenes from '@/content/o-alienista-scenes.json';
export type AnswerResult={ok:boolean;message:string};
const schema=z.object({id:z.string().max(80),mode:z.enum(HELP_MODES),question:z.string().trim().min(3).max(1200),answer:z.string().trim().max(8000),aliases:z.string().max(3000),work:z.enum(['','o-alienista']),scene:z.string().max(10),min:z.coerce.number().int().min(0).max(47),max:z.coerce.number().int().min(0).max(47),status:z.enum(['draft','approved','archived'])});
export async function saveAnswer(_state:AnswerResult,form:FormData):Promise<AnswerResult>{
 await requireCrmHost();const actor=await requireUser('/backoffice/ajuda');if(actor.role!=='admin')return {ok:false,message:'Acesso negado.'};
 const data=schema.safeParse(Object.fromEntries(form.entries()));if(!data.success)return {ok:false,message:'Confira a pergunta, a resposta e os limites das cenas.'};
 const x=data.data;if(x.min>x.max)return {ok:false,message:'A cena inicial não pode ser posterior à final.'};
 if(x.scene&&(!x.work||!scenes.some(s=>s.id===x.scene)))return {ok:false,message:'Escolha uma cena válida e informe a obra.'};
 if(x.status==='approved'&&!x.answer)return {ok:false,message:'Escreva e revise a resposta antes de publicar.'};
 if(x.scene){const index=scenes.findIndex(s=>s.id===x.scene);if(index<x.min||index>x.max)return {ok:false,message:'A cena precisa estar dentro do intervalo de progresso.'};}
 const id=x.id||crypto.randomUUID();const aliases=[...new Set([x.question,...x.aliases.split('\n')].map(normalizeQuestion).filter(Boolean))];
 try{
 await query(`INSERT INTO coonto_answers(id,mode,question,answer,aliases,work_slug,scene_id,min_index,max_index,status,origin,reviewed_by,reviewed_at)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'editorial',$11,NOW()) ON CONFLICT(id) DO UPDATE SET mode=EXCLUDED.mode,question=EXCLUDED.question,answer=EXCLUDED.answer,aliases=EXCLUDED.aliases,work_slug=EXCLUDED.work_slug,scene_id=EXCLUDED.scene_id,min_index=EXCLUDED.min_index,max_index=EXCLUDED.max_index,status=EXCLUDED.status,reviewed_by=EXCLUDED.reviewed_by,reviewed_at=NOW(),updated_at=NOW()`,[id,x.mode,x.question,x.answer,aliases,x.work,x.scene,x.min,x.max,x.status,actor.userId]);
 await recordCrmEvent({type:'help_answer_reviewed',userId:actor.userId,relatedType:'coonto_answer',relatedId:id,metadata:{status:x.status}});
 revalidatePath('/backoffice/ajuda');return {ok:true,message:x.status==='approved'?'Resposta publicada no banco aprovado.':'Resposta salva.'};
 }catch{return {ok:false,message:'Não foi possível salvar. Tente novamente.'};}
}
