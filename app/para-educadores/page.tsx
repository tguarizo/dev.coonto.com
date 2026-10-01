import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CatalogArt } from "@/components/catalog-art";

const paths = [
  { id:"alunos", title:"Usar com meus alunos", description:"Deixe o aluno viver decisões e consequências antes da discussão. Depois, use as escolhas feitas como ponto de partida para aprofundar a obra.", action:"Ver como usar em aula", href:"/para-educadores/com-alunos", image:10 },
  { id:"escola", title:"Levar para minha escola", description:"Apresente uma experiência que também funciona individualmente e pode ser acompanhada pela escola em um piloto estruturado.", action:"Explorar piloto escolar", href:"/para-educadores/na-escola", image:6 },
  { id:"audiencia", title:"Apresentar para minha audiência", description:"Mostre a experiência de entrar em uma obra, decidir e descobrir o caminho do autor antes de explicar a metodologia.", action:"Explorar colaboração", href:"/para-educadores/com-audiencia", image:5 },
];

export default function Educadores() {
  return <main className="page"><SiteHeader/><div className="content">
    <section className="page-hero"><span className="section-kicker">COONTO PARA EDUCADORES</span><h1>O engajamento começa antes do debate.</h1>
      <p>O Coonto não depende de o aluno saber argumentar ou de o professor conduzir uma discussão para funcionar. O aluno começa por uma ação simples: toma uma decisão dentro da história. A consequência cria contexto e curiosidade; a conversa em sala, quando houver, vem depois.</p></section>
    <section className="educator-principle"><strong>O papel do professor muda.</strong><span>Em vez de começar pedindo “analise e argumente”, você pode começar perguntando: “o que você decidiu — e o que aconteceu?”. A obra ganha um ponto de entrada concreto.</span></section>
    <section className="educator-guides" id="guias"><span className="section-kicker">MATERIAL DE APOIO</span><h2>Entenda o método depois de enxergar a experiência</h2><p>Primeiro veja o aluno decidir. Depois, se quiser aprofundar, use os materiais de apoio pedagógico.</p>
      <div className="guide-list"><a href="/guias/Coonto_Para_Educadores_01_Como_Funciona.pdf" target="_blank" rel="noopener">01 · Como funciona? A decisão leva o aluno de volta à obra. Abrir guia →</a>
        <a href="/guias/Coonto_Para_Educadores_02_Quando_Usar.pdf" target="_blank" rel="noopener">02 · Quando usar? Antes, durante ou depois da leitura. Abrir guia →</a>
        <a href="/guias/Coonto_Para_Educadores_03_Uso_em_Aula.pdf" target="_blank" rel="noopener">03 · Como levar à aula? O debate é uma possibilidade de aprofundamento. Abrir guia →</a></div>
      <p><a href="/para-educadores/roteiro-de-aula">Leia o roteiro de aula na página →</a> &nbsp; <a href="/professor">Abra o espaço do professor →</a></p>
    </section>
    <div className="educator-paths">{paths.map(path=><article id={path.id} key={path.id} className="educator-path"><CatalogArt index={path.image} className="educator-path-visual"/><div className="educator-path-body"><h2>{path.title}</h2><p>{path.description}</p><a className="button button-primary" href={path.href}>{path.action}</a></div></article>)}</div>
  </div><SiteFooter/></main>;
}
