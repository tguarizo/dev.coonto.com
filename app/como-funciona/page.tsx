import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {InstallCoonto} from '@/components/install-coonto';
import {CoontoVideos} from '@/components/coonto-videos';

export default function ComoFunciona(){
  return <main className="page"><SiteHeader/><div className="content explain-coonto">
    <span className="section-kicker">AFINAL, O QUE É O COONTO?</span>
    <h1>Você entra na situação.<br/>Decide. E a história responde.</h1>
    <p className="explain-lead">O Coonto transforma uma obra em uma experiência de decisões e consequências. Primeiro você escolhe o que faria. Depois descobre o que sua escolha provoca, compara com o caminho do autor e entende por que aquilo importa na obra.</p>
    <div className="coonto-one-line"><strong>Decidir → Descobrir → Entender → Lembrar</strong><span>Essa é a experiência central. Debate, aula e professor podem ampliar o uso, mas não são necessários para começar.</span></div>
    <div className="coonto-concept" aria-label="Uma plataforma, dois modos de usar">
      <div className="concept-center"><strong>COONTO</strong><span>Uma experiência que funciona sozinho e também pode entrar na sala de aula.</span></div>
      <div className="concept-paths">
        <article><span className="section-kicker">PARA QUEM LÊ</span><h2>Você decide primeiro</h2><p>Entre em uma cena, escolha um caminho, veja a consequência e descubra o que o autor fez. A explicação vem depois da experiência.</p><a className="button button-primary" href="/catalogo">Escolher uma obra</a></article>
        <article><span className="section-kicker">PARA QUEM ENSINA</span><h2>O aluno chega com algo para conversar</h2><p>O professor não precisa criar o engajamento do zero. Pode usar escolhas e consequências já vividas pelos alunos como ponto de partida para aprofundar a obra.</p><a className="button button-primary" href="/para-educadores">Ver uso para educadores</a></article>
      </div>
    </div>
    <h2>Um exemplo com O Alienista</h2>
    <p>Imagine uma situação: Itaguaí começa a reagir às decisões de Bacamarte. O Coonto pergunta o que você faria. Você escolhe. A experiência mostra o que essa decisão poderia provocar. Só então você descobre o caminho seguido por Machado de Assis e recebe contexto para entender a diferença.</p>
    <div className="coonto-use-moments"><article><h3>Antes da leitura</h3><p>Entre no livro com uma pergunta e curiosidade sobre o que acontecerá.</p></article><article><h3>Durante a leitura</h3><p>Compare suas decisões com a obra enquanto acompanha os acontecimentos.</p></article><article><h3>Depois da leitura</h3><p>Revisite conflitos decisivos para compreender e lembrar melhor o que leu.</p></article></div>
    <p><strong>O Coonto não substitui o livro e não exige debate. Ele cria uma razão pessoal para querer descobrir o caminho do autor.</strong></p>
    <CoontoVideos/>
    <InstallCoonto/><p><a href="/ajuda">Precisa de orientação? Abra a Ajuda Coonto.</a></p>
  </div><SiteFooter/></main>;
}
