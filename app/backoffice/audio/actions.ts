"use server";
import {revalidatePath} from 'next/cache';
import {requireCrmHost} from '@/lib/admin-host';
import {requireUser} from '@/lib/auth';
import {audioInput,AudioError,produceAudio,publishAudio} from '@/lib/audio-production';
export type AudioResult={ok:boolean;message:string;jobId?:string};
export async function generateAudio(_state:AudioResult,form:FormData):Promise<AudioResult>{
 await requireCrmHost();const actor=await requireUser('/backoffice/audio');if(actor.role!=='admin')return {ok:false,message:'Acesso restrito à administração.'};
 let segments:unknown;try{segments=JSON.parse(String(form.get('segments')));}catch{return {ok:false,message:'Confira o texto e a voz.'};}
 const parsed=audioInput.safeParse({sceneId:form.get('sceneId'),segments});if(!parsed.success)return {ok:false,message:'Escolha uma cena e escreva até 5.000 caracteres, em até dois trechos.'};
 try{const jobId=await produceAudio(parsed.data,actor.userId);revalidatePath('/backoffice/audio');return {ok:true,message:'Rascunho gerado. Ouça antes de aprovar.',jobId};}
 catch(error){revalidatePath('/backoffice/audio');return {ok:false,message:error instanceof AudioError?error.message:'Não foi possível concluir a geração. Confira o histórico antes de tentar novamente.'};}
}
export async function approveAudio(_state:AudioResult,form:FormData):Promise<AudioResult>{
 await requireCrmHost();const actor=await requireUser('/backoffice/audio');if(actor.role!=='admin')return {ok:false,message:'Acesso restrito à administração.'};
 try{await publishAudio(String(form.get('jobId')),actor.userId);revalidatePath('/backoffice/audio');return {ok:true,message:'Áudio aprovado e publicado na cena. Não houve nova geração.'};}
 catch(error){return {ok:false,message:error instanceof AudioError?error.message:'Não foi possível publicar o áudio. O áudio anterior foi preservado se a cópia falhou.'};}
}
