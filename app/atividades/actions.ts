'use server';
import { requireUser } from '@/lib/auth';
import { submitActivity } from '@/lib/educational-activities';
import { redirect } from 'next/navigation';
export async function sendSubmission(form:FormData){
 const user=await requireUser('/atividades');
 const ok=await submitActivity(user.userId,String(form.get('activity')||''),String(form.get('body')||'').trim());
 redirect('/atividades?resultado='+(ok?'enviado':'indisponivel'));
}
