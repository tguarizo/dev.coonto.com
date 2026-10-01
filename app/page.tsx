import { ArrowDown, ArrowRight, BookOpenCheck, Brain, Building2, Compass, GraduationCap, MessageCircle, MousePointerClick, Sparkles, WandSparkles } from "lucide-react";
import { MobileSiteMenu } from "@/components/mobile-site-menu";
import { getCommercialSettings } from "@/lib/commercial";

export const dynamic = "force-dynamic";

const methodSteps = [
  { label: "Entre na situação", description: "Você encontra um conflito da obra.", icon: Compass },
  { label: "Decida", description: "Escolha o que faria naquele momento.", icon: MousePointerClick },
  { label: "Veja a consequência", description: "A história responde à sua escolha.", icon: WandSparkles },
  { label: "Descubra o autor", description: "Compare com o caminho da obra original.", icon: BookOpenCheck },
  { label: "Entenda e lembre", description: "Contexto e significado fixam a experiência.", icon: Brain },
];

const audienceCards = [
  {
    href: "/para-educadores",
    eyebrow: "EU ENSINO, ORIENTO OU MULTIPLICO",
    title: "Quero usar o Coonto com alunos.",
    text: "O aluno vive a experiência primeiro. A conversa em sala pode vir depois — sem depender de debate para o Coonto funcionar.",
    image: "/images/educadores.png",
    className: "audience-card educator",
    icon: GraduationCap,
  },
  {
    href: "/para-leitores",
    eyebrow: "EU QUERO COMPREENDER",
    title: "Quero entrar na obra e descobrir o caminho do autor.",
    text: "Sou aluno, vestibulando ou leitor. Eu decido, vejo as consequências e comparo minha escolha com a história original.",
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
          <a href="/como-funciona">O que é o Coonto?</a>
          <a className="home-nav-secondary" href="/professor">Espaço do professor</a>
          <a className="survey-nav-link" href="/pesquisa">Pesquisa</a>
          <a className="home-nav-secondary" href="/parceiros">Seja parceiro</a>
          <a className="home-nav-secondary" href="#feedback">Feedback</a>
          <a href="/login?return_to=%2Fminha-biblioteca">Entrar</a>
        </nav><MobileSiteMenu/>
      </header>

      <section className="method-intro clarity-home" aria-labelledby="method-title">
        <div className="method-intro-heading">
          <span className="method-kicker">ENTRE NA HISTÓRIA. TOME A DECISÃO.</span>
          <h1 id="method-title">E se você pudesse<br /><em>decidir antes do personagem?</em></h1>
          <p className="clarity-lead">O Coonto transforma grandes obras em experiências de decisão. Você entra em uma situação da história, escolhe o que faria, vê a consequência e então descobre o caminho escolhido pelo autor.</p>
          <p className="clarity-note"><strong>Não é uma plataforma de debate.</strong> Você pode usar sozinho. Professor, turma e discussão são possibilidades — não requisitos.</p>
          <a className="method-down" href="#como-acontece">Veja em 20 segundos <ArrowDown size={18} aria-hidden="true" /></a>
        </div>

        <div className="method-visual" id="como-acontece" aria-label="Como funciona a experiência Coonto">
          <div className="method-book" aria-hidden="true"><span>O ALIENISTA</span><strong>Você<br />decide.</strong><small>MACHADO RESPONDE</small></div>
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

        <div className="decision-demo" aria-label="Exemplo prático com O Alienista">
          <div className="decision-demo-intro">
            <span className="method-example-label"><span className="method-example-dot" />EXEMPLO · O ALIENISTA</span>
            <strong>Itaguaí começa a reagir à Casa Verde. Se você estivesse no lugar de Bacamarte, o que faria?</strong>
          </div>
          <div className="decision-demo-options">
            <span>A · Recuar e rever as internações</span>
            <span>B · Manter os critérios</span>
            <span>C · Ampliar as internações</span>
          </div>
          <div className="decision-demo-result"><strong>Você escolhe primeiro.</strong><span>Depois o Coonto mostra as consequências, revela o caminho de Machado e explica o que essa diferença ajuda a compreender.</span></div>
          <a href="/obra/o-alienista">Quero experimentar <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
      </section>

      <section className="clarity-proof" aria-label="O que o Coonto é e o que ele não exige">
        <div><strong>Funciona individualmente</strong><span>O aluno não precisa esperar uma aula ou uma turma.</span></div>
        <div><strong>Não exige argumentação prévia</strong><span>A primeira ação é simples: escolher. A reflexão vem da consequência.</span></div>
        <div><strong>O professor entra depois, se quiser</strong><span>Discussão, comparação e aula podem aprofundar uma experiência que já aconteceu.</span></div>
      </section>

      <section className="home-choose" id="escolha-seu-caminho" aria-labelledby="choose-title">
        <span className="method-kicker">AGORA QUE VOCÊ ENTENDEU A IDEIA</span>
        <h2 id="choose-title">Como você quer usar o Coonto?</h2>
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
        <a href="/obra/o-alienista" className="proof-link"><strong>Decidir → Descobrir → Entender → Lembrar.</strong><span>Veja a experiência funcionando →</span></a>
        <a href="/catalogo" className="proof-link"><strong>Uma obra, muitas decisões</strong><span>Conheça as próximas experiências →</span></a>
        <a href={freeWork.href} className="proof-link"><strong>Obra gratuita agora: {freeWork.title}</strong><span>Comece sem depender de uma turma →</span></a>
      </section>
      <section className="home-next" id="feedback">
        <div>
          <span className="section-kicker">A PLATAFORMA COMEÇA ESCUTANDO</span>
          <h2>Entendeu o Coonto em poucos segundos? Essa resposta também faz parte do nosso teste.</h2>
        </div>
        <div className="home-next-actions">
          <a href="/obra/o-alienista#feedback" className="button button-coral"><MessageCircle size={19} />Dar feedback</a>
          <a href="/parceiros" className="button button-outline"><Building2 size={19} />Construir conosco</a>
        </div>
      </section>
    </main>
  );
}
