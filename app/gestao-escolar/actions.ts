'use server';
import {educationContexts} from '@/lib/education-context';
import {requireEducationVerification} from '@/lib/education-session';
import { requireUser } from '@/lib/auth';
import { createActivity,giveFeedback } from '@/lib/educational-activities';
import { redirect } from 'next/navigation';
const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
async function verifyManager(user:Awaited<ReturnType<typeof requireUser>>,organization:string){const context=(await educationContexts(user.userId)).find(c=>c.id===organization);if(context?.role==='manager')requireEducationVerification(user,'/gestao-escolar?instituicao='+encodeURIComponent(organization));}
export async function publishActivity(form:FormData){
 const user=await requireUser('/gestao-escolar'),organization=text(form,'organization');
 await verifyManager(user,organization);
 const ok=await createActivity(user.userId,organization,text(form,'classroom'),text(form,'title'),text(form,'instructions'));
 redirect(`/gestao-escolar?instituicao=${encodeURIComponent(organization)}&resultado=${ok?'publicado':'indisponivel'}`);
}
export async function sendFeedback(form:FormData){
 const user=await requireUser('/gestao-escolar'),organization=text(form,'organization'),activity=text(form,'activity');
 await verifyManager(user,organization);
 const ok=await giveFeedback(user.userId,organization,activity,text(form,'student'),text(form,'feedback'));
 redirect(`/gestao-escolar?instituicao=${encodeURIComponent(organization)}&atividade=${encodeURIComponent(activity)}&resultado=${ok?'devolutiva':'indisponivel'}`);
}
