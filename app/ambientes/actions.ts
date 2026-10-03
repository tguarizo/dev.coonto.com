'use server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {getAccessProfile} from '@/lib/access-control';
import {educationContexts} from '@/lib/education-context';
import {networkContexts} from '@/lib/education-network';
import {contextDestinations} from '@/lib/navigation-context';
export async function chooseContext(form:FormData){
 const user=await requireUser('/ambientes');
 const [profile,schools,networks]=await Promise.all([getAccessProfile(user),educationContexts(user.userId),networkContexts(user.userId)]);
 const key=String(form.get('context')||''),destination=contextDestinations(profile,schools,networks).get(key);
 if(!destination)redirect('/ambientes?trocar=1');
 const jar=await cookies();if(form.get('remember')==='on')jar.set('coonto_context',JSON.stringify({userId:user.userId,key}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});else jar.delete('coonto_context');
 redirect(destination);
}
