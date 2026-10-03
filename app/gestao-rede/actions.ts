'use server';
import {requireUser} from '@/lib/auth';
import {requireEducationVerification} from '@/lib/education-session';
import {allocateSchoolSeats} from '@/lib/education-licenses';
import {redirect} from 'next/navigation';
export async function allocateLicenses(form:FormData){
 const user=await requireUser('/gestao-rede'),network=String(form.get('network')||'');
 const base='/gestao-rede?rede='+encodeURIComponent(network);requireEducationVerification(user,base);
 const raw=String(form.get('seats')||''),ok=/^\d+$/.test(raw)&&await allocateSchoolSeats(user.userId,network,String(form.get('contract')||''),String(form.get('school')||''),Number(raw));
 redirect(base+'&resultado='+(ok?'salvo':'indisponivel'));
}
