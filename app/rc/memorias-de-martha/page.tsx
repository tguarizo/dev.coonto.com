import {RcLiteraryExperience} from '@/components/rc-literary-experience';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {getCurrentUser} from '@/lib/auth';
import {getRcWork} from '@/lib/rc-content';
export const dynamic='force-dynamic';
export default async function Page(){
 const [work,user]=await Promise.all([getRcWork('memorias-de-martha'),getCurrentUser()]);
 return <main className="page"><SiteHeader/><div className="content member-page"><RcLiteraryExperience work={work} signedIn={Boolean(user)}/></div><SiteFooter/></main>;
}
