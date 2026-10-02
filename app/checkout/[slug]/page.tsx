import {requireUser} from '@/lib/auth';
import {ensureWorkEntitlement} from '@/lib/member';
import {freeWork} from '@/lib/free-works';
import {getCommercialSettings,formatBRL} from '@/lib/commercial';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {FreeCheckoutButton} from '@/components/free-checkout-button';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Checkout({params,searchParams}:{params?:Promise<{slug:string}>;searchParams:Promise<{return_to?:string}>}){
 const slug=(await params)?.slug||'o-alienista',work=freeWork(slug);if(!work)notFound();
 const search=await searchParams,returnTo=slug==='o-alienista'&&search.return_to==='/professor'?'/professor':work.href;
 const user=await requireUser('/checkout/'+slug);
 const [access,prices]=await Promise.all([ensureWorkEntitlement(user.userId,slug),getCommercialSettings()]);
 return <main className="page"><SiteHeader/><div className="content checkout-page"><div><span className="section-kicker">PEDIDO GRATUITO · {work.title}</span><h1>Escolha por onde começar.</h1><p>Adicione esta experiência à sua biblioteca por R$ 0,00. As três obras desta beta estão disponíveis gratuitamente, sem cartão nem assinatura.</p><p>Depois de entrar na obra, use “Baixar neste aparelho” para continuar sem internet.</p><a href="/catalogo#catalogo-obras">Escolher outra obra</a></div><section className="checkout-summary"><h2>{work.title}</h2><p>{work.author} · {work.detail}</p><div className="checkout-line"><span>Valor por obra previsto</span><s>{formatBRL(prices.single_price_cents)}</s></div><div className="checkout-total"><strong>Total nesta beta</strong><strong>R$ 0,00</strong></div>{access?<><p>Esta obra já está na sua biblioteca.</p><a className="button button-primary" href={returnTo}>Entrar na experiência</a></>:<FreeCheckoutButton returnTo={returnTo} workSlug={slug}/>}<p className="checkout-small">Seu progresso e suas anotações pertencem à sua conta. Martha e Dante continuam em revisão editorial.</p></section></div><SiteFooter/></main>;
}
