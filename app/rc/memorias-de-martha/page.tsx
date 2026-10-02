import {RcLiteraryExperience} from '@/components/rc-literary-experience';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {getCurrentUser} from '@/lib/auth';
import {getRcWork} from '@/lib/rc-content';
export const dynamic='force-dynamic';
export default async function Page(){
 const [work,user]=await Promise.all([getRcWork('memorias-de-martha'),getCurrentUser()]);
 return <main className="reader-page"><link rel="stylesheet" href="/rc-reader.css"/><SiteHeader/><RcLiteraryExperience work={work} signedIn={Boolean(user)}/></main>;
}
