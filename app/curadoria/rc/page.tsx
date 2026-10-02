import {requireUser} from '@/lib/auth';
import {getAccessProfile} from '@/lib/access-control';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {RcEditor} from '@/components/rc-editor';
export const dynamic='force-dynamic';
export default async function Page(){const user=await requireUser('/curadoria/rc');const access=await getAccessProfile(user);return <main className="page"><SiteHeader/><div className="content member-page"><h1>Curadoria · Beta RC</h1>{access.canUseCulturalCrm?<RcEditor/>:<p>Acesso restrito a administradores e curadores com obras atribuídas.</p>}</div><SiteFooter/></main>;}
