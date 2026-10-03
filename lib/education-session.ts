import {redirect} from 'next/navigation';
import {loginPath,type CoontoUser} from '@/lib/auth';
const day=(date:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function verifiedToday(authenticatedAt:string|undefined,now=new Date()){
 if(!authenticatedAt)return false;const verified=new Date(authenticatedAt);
 return Number.isFinite(verified.getTime())&&verified<=now&&day(verified)===day(now);
}
export function requireEducationVerification(user:CoontoUser,returnTo:string){if(!verifiedToday(user.authenticatedAt))redirect(loginPath(returnTo));}
