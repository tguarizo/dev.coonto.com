import {LoginForm} from '@/components/login-form';
import {LoginVisual} from '@/components/login-visual';
import '../backoffice/crm/styles.css';
import './styles.css';
import {SiteHeader} from '@/components/site-header';
import {isCrmHost} from '@/lib/admin-host';
import {currentLoginArt} from '@/lib/login-art';
import {smsConfigured} from '@/lib/message-provider.cjs';
import {safeReturnTo} from '@/lib/login-contact';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{return_to?:string}>}) {
 const crm=await isCrmHost(),params=await searchParams;
 const returnTo=crm?'/backoffice':params.return_to===undefined?'/ambientes':safeReturnTo(params.return_to);
 return <main className="login-page"><SiteHeader/><div className="coonto-login-layout"><LoginForm returnTo={returnTo} smsEnabled={smsConfigured()}/><LoginVisual image={currentLoginArt()}/></div>{crm&&<p className="login-crm-note">O CRM é reservado às pessoas autorizadas. Uma conta Guest não concede acesso administrativo.</p>}</main>;
}
