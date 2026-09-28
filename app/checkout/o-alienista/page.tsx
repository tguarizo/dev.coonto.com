import { requireUser } from "@/lib/auth";
import { ensureAlienistaEntitlement } from "@/lib/member";
import { getCommercialSettings,formatBRL } from "@/lib/commercial";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FreeCheckoutButton } from "@/components/free-checkout-button";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";
export default async function Checkout({searchParams}:{searchParams:Promise<{return_to?:string}>}) {
  const params=await searchParams;
  const returnTo=params.return_to==="/professor"?"/professor":"/leitura/o-alienista";
  const user=await requireUser(`/checkout/o-alienista?return_to=${encodeURIComponent(returnTo)}`);
  const [access,prices]=await Promise.all([ensureAlienistaEntitlement(user.userId),getCommercialSettings()]);
  if (!access && prices.freeWork.slug !== "o-alienista") redirect("/catalogo#ofertas");
  return <main className="page"><SiteHeader/><div className="content checkout-page">
    <div><span className="section-kicker">PEDIDO GRATUITO · O ALIENISTA</span><h1>Seu primeiro livro, sem pagar nada.</h1>
      <p>Viva a obra para compreendê-la. Confirme o pedido para ver como uma obra entra na sua biblioteca Coonto.</p>
      <p>Nenhum cartão será solicitado. Não há assinatura nem cobrança automática.</p></div>
    <section className="checkout-summary"><h2>Resumo do pedido</h2><div className="checkout-line"><span>O Alienista · experiência completa</span><span><s>{formatBRL(prices.single_price_cents)}</s></span></div>
      <div className="checkout-line"><span>Oferta gratuita atual</span><strong>− {formatBRL(prices.single_price_cents)}</strong></div>
      <div className="checkout-total"><strong>Total</strong><strong>R$ 0,00</strong></div>
      {access?<><p>Esta obra já está na sua biblioteca.</p><a className="button button-primary" href={returnTo}>Continuar</a></>:<FreeCheckoutButton returnTo={returnTo}/>}
      <p className="checkout-small">Ao confirmar, registramos um pedido de valor zero e liberamos a obra nesta conta. Você pode ler o texto original separadamente.</p>
    </section>
  </div><SiteFooter/></main>;
}
