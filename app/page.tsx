import { ArrowDown, ArrowRight, BookOpenCheck, Brain, Building2, Compass, GraduationCap, Lightbulb, MessageCircle, ScanEye, Sparkles } from "lucide-react";
import { getCommercialSettings } from "@/lib/commercial";

export const dynamic = "force-dynamic";

const methodSteps = [
  { label: "Situação", description: "Uma tensão da obra", icon: ScanEye },
  { label: "Decisão", description: "Sua hipótese", icon: Lightbulb },
  { label: "Descoberta", description: "Consequências e pistas", icon: Compass },
  { label: "Evidência", description: "De volta ao livro", icon: BookOpenCheck },
  { label: "Memória", description: "O que ficou com você", icon: Brain },
];

const audienceCards = [
  {
    href: "/para-educadores",
    eyebrow: "EU ENSINO, ORIENTO OU MULTIPLICO",
    title: "Quero ajudar alguém a compreender melhor.",
    text: "Sou professor, coordenador, dirigente escolar, curador, influenciador ou criador de conteúdo.",
    image: "/images/educadores.png",
    className: "audience-card educator",
    icon: GraduationCap,
  },
  {
    href: "/para-leitores",
    eyebrow: "EU QUERO COMPREENDER",
    title: "Quero entrar na obra — e sair entendendo.",
    text: "Sou aluno, vestibulando, leitor ou alguém que cansou de terminar uma obra sem realmente compreendê-la.",
    image: "/images/leitores.png",
    className: "audience-card learner",
    icon: Sparkles,
  },
];

export default async function Home() {
  const { freeWork } = await getCommercialSettings();
  return (
    <main className="home-shell">
      <header className="home-header">
        <img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo" />
        <nav aria-label="Navegação principal">
          <a href="/catalogo">Catálogo</a>
          <a className="home-nav-secondary" href="/para-educadores#guias">Entenda o método</a>
          <a className="survey-nav-link" href="/pesquisa">Pesquisa</a>
          <a className="home-nav-secondary" href="/parceiros">Seja parceiro</a>
          <a className="home-nav-secondary" href="#feedback">Feedback</a>
          <a href="/login?return_to=%2Fminha-biblioteca">Entrar</a>
        </nav>
      </header>
      <section className="method-intro" aria-labelledby="method-title">
        <div className="method-intro-heading">
          <span className="method-kicker">UMA OUTRA FORMA DE ENTRAR NO LIVRO</span>
          <h1 id="method-title">Já se perdeu em um livro?<br /><em>Vamos entrar juntos.</em></h1>
          <p>Às vezes os personagens se confundem, uma palavra trava a leitura ou você não sabe o que procurar. No Coonto, você conhece uma situação da obra, faz uma escolha e descobre pistas. Depois volta ao livro para conferir sua ideia no texto. Assim, a leitura ganha perguntas que são suas.</p>
          <a className="method-down" href="#escolha-seu-caminho">Quero experimentar <ArrowDown size={18} aria-hidden="true" /></a>
        </div>
        <div className="method-visual" aria-label="O ciclo de leitura do Coonto, do encontro com a cena à memória">
          <div className="method-book" aria-hidden="true"><span>COONTO</span><strong>Uma<br />obra</strong><small>MUITAS DESCOBERTAS</small></div>
          <div className="method-steps">
            {methodSteps.map((step, index) => {
              const Icon = step.icon;
              return <div className="method-step" key={step.label}>
                <span className="method-step-number">0{index + 1}</span>
                <span className="method-step-icon"><Icon size={23} strokeWidth={1.9} aria-hidden="true" /></span>
                <span className="method-step-copy"><strong>{step.label}</strong><small>{step.description}</small></span>
              </div>;
            })}
          </div>
        </div>
        <div className="method-example">
          <div className="method-example-label"><span className="method-example-dot" />UM EXEMPLO NA PRÁTICA</div>
          <p><strong>Em O Alienista:</strong> quem decide quem é considerado louco em Itaguaí?</p>
          <span>Escolha uma hipótese. A experiência mostra pistas e leva você às passagens de Machado para conferir ou mudar de ideia.</span>
          <a href="/obra/o-alienista">Conheça a experiência <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
      </section>
      <section className="home-choose" id="escolha-seu-caminho" aria-labelledby="choose-title">
        <span className="method-kicker">SEU PRÓXIMO PASSO</span>
        <h2 id="choose-title">Como você quer começar?</h2>
      </section>
      <section className="split-hero compact-hero" aria-label="Escolha seu caminho no Coonto">
        {audienceCards.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.href} href={item.href} className={item.className} aria-label={`${item.eyebrow}: ${item.title}`}>
              <img src={item.image} alt="" className="audience-image" />
              <span className="audience-overlay" />
              <span className="audience-copy">
                <span className="audience-eyebrow"><Icon size={18} />{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <span className="audience-description">{item.text}</span>
                <span className="audience-cta">Escolher este caminho <ArrowRight size={20} /></span>
              </span>
            </a>
          );
        })}
        <div className="hero-center-mark" aria-hidden="true">ou</div>
      </section>
      <section className="proof-strip">
        <a href="/obra/o-alienista" className="proof-link"><strong>Viva a obra para compreendê-la.</strong><span>Veja como a experiência funciona →</span></a>
        <a href="/catalogo" className="proof-link"><strong>Um catálogo em construção</strong><span>Conheça as próximas obras →</span></a>
        <a href={freeWork.href} className="proof-link"><strong>Obra gratuita agora: {freeWork.title}</strong><span>Comece pela experiência disponível →</span></a>
      </section>
      <section className="home-next" id="feedback">
        <div>
          <span className="section-kicker">A PLATAFORMA COMEÇA ESCUTANDO</span>
          <h2>O que você disser agora ajuda a decidir o que o Coonto será amanhã.</h2>
        </div>
        <div className="home-next-actions">
          <a href="/obra/o-alienista#feedback" className="button button-coral"><MessageCircle size={19} />Dar feedback</a>
          <a href="/parceiros" className="button button-outline"><Building2 size={19} />Construir conosco</a>
        </div>
      </section>
    </main>
  );
}
