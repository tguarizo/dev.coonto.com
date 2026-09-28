import { ArrowRight, BookOpen, LibraryBig } from "lucide-react";
import { formatBRL, getCommercialSettings } from "@/lib/commercial";

type Settings = Awaited<ReturnType<typeof getCommercialSettings>>;

export function AccessOffers({ settings }: { settings: Settings }) {
  const { freeWork } = settings;
  return <div className="offer-grid offer-grid-three">
    <article className="price-card free-offer">
      <span className="offer-label">EXPERIMENTE AGORA</span>
      <h3>Obra gratuita</h3>
      <p><strong>{freeWork.title}</strong> é a experiência gratuita em destaque neste momento.</p>
      <span className="offer-price">R$ 0,00</span>
      <span className="offer-status">Acesso disponível · sem cartão</span>
      <a className="button button-primary" href={freeWork.checkoutHref}><BookOpen size={18}/> Começar {freeWork.title}</a>
      <p className="access-note">Após entrar, a obra ficará na sua biblioteca. A obra gratuita em destaque poderá mudar.</p>
    </article>
    <article className="price-card">
      <span className="offer-label">ESCOLHA UMA OBRA</span>
      <h3>Obra individual</h3>
      <p>Escolha uma experiência do catálogo para acessar separadamente quando as vendas forem abertas.</p>
      <span className="offer-price">{formatBRL(settings.single_price_cents)}</span>
      <span className="offer-status muted">Preço planejado · vendas ainda não abertas</span>
      <a className="button button-outline" href="/catalogo#catalogo-obras">Ver obras do catálogo <ArrowRight size={18}/></a>
      <p className="access-note">Hoje não há compra de obra individual. As próximas experiências estão em preparação.</p>
    </article>
    <article className="price-card club">
      <span className="offer-label">ACERVO COONTO</span>
      <h3>Coonto Club</h3>
      <p>Acesso ao acervo e às novas experiências após o lançamento do Club.</p>
      <span className="offer-price">{formatBRL(settings.club_price_cents)}<small>/mês</small></span>
      <span className="offer-status muted">Preço planejado · assinatura ainda não ativa</span>
      <a className="button button-outline" href="/catalogo#catalogo-obras"><LibraryBig size={18}/> Conhecer o acervo</a>
      <p className="access-note">Não há cobrança automática nem assinatura disponível nesta fase de validação.</p>
    </article>
  </div>;
}
