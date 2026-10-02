import { ArrowRight, LockKeyhole } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SuggestionForm } from "@/components/suggestion-form";
import { getCommercialSettings } from "@/lib/commercial";
import { AccessOffers } from "@/components/access-offers";
import { CatalogArt } from "@/components/catalog-art";
import { FormJump } from "@/components/form-jump";

const nextWorks = [
  {
    "title": "Dom Casmurro",
    "author": "Machado de Assis"
  },
  {
    "title": "Vida e morte de M. J. Gonzaga de Sá",
    "author": "Lima Barreto"
  },
  {
    "title": "Lésbia",
    "author": "Maria Benedita Bormann"
  },
  {
    "title": "O Cortiço",
    "author": "Aluísio Azevedo"
  },
  {
    "title": "Úrsula",
    "author": "Maria Firmina dos Reis"
  },
  {
    "title": "Triste fim de Policarpo Quaresma",
    "author": "Lima Barreto"
  },
  {
    "title": "Quincas Borba",
    "author": "Machado de Assis"
  },
  {
    "title": "O Ateneu",
    "author": "Raul Pompeia"
  },
  {
    "title": "Nebulosas",
    "author": "Narcisa Amália"
  },
  {
    "title": "Conselhos à minha filha",
    "author": "Nísia Floresta"
  },
  {
    "title": "Opúsculo Humanitário",
    "author": "Nísia Floresta"
  },
  {
    "title": "Broquéis",
    "author": "Cruz e Sousa"
  }
];

import {freeWorks} from "@/lib/free-works";

export const dynamic = "force-dynamic";
export default async function Catalogo() {
  const prices = await getCommercialSettings();
  const alienistaIsFree = prices.freeWork.slug === "o-alienista";
  return (
    <main className="page">
      <SiteHeader /><FormJump target="sugerir-obra" label="Sugerir uma obra ↓" />
      <div className="content">
        <section className="catalog-hero">
          <div><span className="section-kicker">CATÁLOGO COONTO</span><h1>Grandes obras.<br/>Novas portas.</h1></div>
          <p>Escolha uma das três experiências disponíveis gratuitamente nesta beta. Martha e o Canto I de Dante seguem em revisão editorial.</p>
        </section>
        <section className="catalog-grid" id="catalogo-obras" aria-label="Três obras disponíveis gratuitamente">{freeWorks.map((work,index)=><article key={work.slug} className="book-card featured"><CatalogArt index={work.art} className="catalog-card-art"/><span className="book-number">0{index+1}</span><div><span className="tag">GRATUITA NESTA BETA</span><h2>{work.title}</h2><span className="author">{work.author}</span><p>{work.detail}. Entre, decida, descubra, confira e lembre.</p></div><div><a href={'/checkout/'+work.slug} className="button button-light">Adicionar gratuitamente <ArrowRight size={18}/></a><p><a href={work.slug==='o-alienista'?'/obra/o-alienista':work.href} style={{color:'inherit',textDecoration:'underline'}}>Conhecer a experiência</a></p></div></article>)}</section>
        <section className="catalog-offer" id="ofertas" aria-labelledby="catalog-offer-title">
          <span className="section-kicker">FORMAS DE ACESSO · FASE DE VALIDAÇÃO</span>
          <h2 id="catalog-offer-title">Escolha como quer entrar.</h2>
          <p>As três obras desta beta estão gratuitas agora. Os valores de obra individual e Club mostram a proposta para a fase comercial; ainda não há cobrança.</p>
          <AccessOffers settings={prices}/>
        </section>
        <section className="catalog-pipeline" aria-labelledby="pipeline-title"><span className="section-kicker">PRÓXIMAS CANDIDATAS</span><h2 id="pipeline-title">A lista continua.</h2><p>Imagens ilustrativas para ajudar a explorar o catálogo. Ainda não representam capas finais nem obras disponíveis. A seleção depende de curadoria, direitos e produção; a frequência mensal começa com o Club lançado.</p><ol>{nextWorks.map((work,index)=><li key={work.title}><CatalogArt index={index+3}/><span><strong>{work.title}</strong><small style={{display:"block"}}>{work.author}</small></span></li>)}</ol></section>
        <section className="suggestion-section" id="sugerir-obra"><div><span className="section-kicker">SUA VOZ NO CATÁLOGO</span><h2>Qual obra você quer viver no Coonto?</h2><p>Sugira uma obra e conte por que ela importa para você. A sugestão entra na avaliação editorial, sem garantir produção ou data.</p></div><SuggestionForm/></section>
      </div>
      <SiteFooter />
    </main>
  );
}
