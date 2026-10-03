'use server';
import {requireUser} from '@/lib/auth';
import {requireEducationVerification} from '@/lib/education-session';
import {assignInstitutionalLicense,revokeInstitutionalLicense} from '@/lib/education-licenses';
import {redirect} from 'next/navigation';
export async function changeInstitutionalLicense(form:FormData){
 const user=await requireUser('/licencas-institucionais'),school=String(form.get('school')||'');
 const base='/licencas-institucionais?instituicao='+encodeURIComponent(school);requireEducationVerification(user,base);
 const action=String(form.get('action')||'');
 const ok=action==='assign'?await assignInstitutionalLicense(user.userId,school,String(form.get('contract')||''),String(form.get('student')||'')):
 action==='revoke'?await revokeInstitutionalLicense(user.userId,school,String(form.get('grant')||'')):false;
 redirect(base+'&resultado='+(ok?'salvo':'indisponivel'));
}
