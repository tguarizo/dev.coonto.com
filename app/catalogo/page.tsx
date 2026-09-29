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
    "title": "Memórias de Martha",
    "author": "Júlia Lopes de Almeida"
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
          <p>Estas são as três obras previstas para o catálogo inicial. Publicaremos cada experiência quando estiver concluída e revisada; o lançamento do Coonto Club como produto depende das três prontas.</p>
        </section>
        <section className="catalog-grid" id="catalogo-obras" aria-label="Três obras do catálogo inicial">
          <article className="book-card featured">
            <CatalogArt index={0} className="catalog-card-art"/>
            <span className="book-number">01</span>
            <div><span className="tag">{alienistaIsFree ? "DISPONÍVEL · GRATUITA AGORA" : "DISPONÍVEL · CONHEÇA A OBRA"}</span><h2>O Alienista</h2><span className="author">Machado de Assis</span><p>Quem decide o que é normal em Itaguaí? Faça escolhas, siga as pistas e volte ao texto para conferir suas ideias.</p></div>
            <div><a href={alienistaIsFree ? "/checkout/o-alienista" : "/obra/o-alienista"} className="button button-light">{alienistaIsFree ? "Fazer pedido gratuito" : "Conhecer a experiência"} <ArrowRight size={18}/></a><p><a href="/texto/o-alienista" style={{color:"inherit",textDecoration:"underline"}}>Ler o texto original de Machado</a></p></div>
          </article>
          <article className="book-card upcoming"><CatalogArt index={1} className="catalog-card-art"/><div><span className="tag">EM PREPARAÇÃO</span><h2>Dom Casmurro</h2><span>Machado de Assis</span><p>Memória, dúvida e interpretação: uma narrativa que nunca entrega tudo.</p></div><span className="button button-outline"><LockKeyhole size={17}/>Ainda indisponível</span></article>
          <article className="book-card upcoming"><CatalogArt index={2} className="catalog-card-art"/><div><span className="tag">EM PREPARAÇÃO</span><h2>Memórias Póstumas de Brás Cubas</h2><span>Machado de Assis</span><p>Uma entrada irreverente nas escolhas do narrador e nas contradições humanas.</p></div><span className="button button-outline"><LockKeyhole size={17}/>Ainda indisponível</span></article>
        </section>
        <section className="catalog-offer" id="ofertas" aria-labelledby="catalog-offer-title">
          <span className="section-kicker">FORMAS DE ACESSO · FASE DE VALIDAÇÃO</span>
          <h2 id="catalog-offer-title">Escolha como quer entrar.</h2>
          <p>Uma obra está gratuita agora. Os valores de obra individual e Club mostram a proposta para a fase comercial; ainda não há cobrança.</p>
          <AccessOffers settings={prices}/>
        </section>
        <section className="catalog-pipeline" aria-labelledby="pipeline-title"><span className="section-kicker">PRÓXIMAS CANDIDATAS</span><h2 id="pipeline-title">A lista continua.</h2><p>Imagens ilustrativas para ajudar a explorar o catálogo. Ainda não representam capas finais nem obras disponíveis. A seleção depende de curadoria, direitos e produção; a frequência mensal começa com o Club lançado.</p><ol>{nextWorks.map((work,index)=><li key={work.title}><CatalogArt index={index+3}/><span><strong>{work.title}</strong><small style={{display:"block"}}>{work.author}</small></span></li>)}</ol></section>
        <section className="catalog-offer"><span className="section-kicker">BÔNUS EM AVALIAÇÃO</span><h2>A Divina Comédia · Dante Alighieri</h2><p>Uma possível porta de entrada para o Inferno, com perguntas sobre a jornada de Dante. A experiência ainda depende de curadoria, seleção da tradução e produção; não está disponível.</p></section>
        <section className="suggestion-section" id="sugerir-obra"><div><span className="section-kicker">SUA VOZ NO CATÁLOGO</span><h2>Qual obra você quer viver no Coonto?</h2><p>Sugira uma obra e conte por que ela importa para você. A sugestão entra na avaliação editorial, sem garantir produção ou data.</p></div><SuggestionForm/></section>
      </div>
      <SiteFooter />
    </main>
  );
}
