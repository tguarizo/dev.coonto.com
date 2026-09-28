import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CatalogArt } from "@/components/catalog-art";

const paths = [
  { id:"alunos", title:"Usar com meus alunos", description:"Prepare uma aula com pontos de entrada, exercícios guiados e o texto de Machado ao lado. Veja um exemplo antes de abrir o espaço do professor.", action:"Ver como usar em aula", href:"/para-educadores/com-alunos", image:10 },
  { id:"escola", title:"Levar para minha escola", description:"Conheça um caminho para apresentar o método à coordenação, planejar um piloto e combinar como observar a compreensão dos estudantes.", action:"Explorar piloto escolar", href:"/para-educadores/na-escola", image:6 },
  { id:"audiencia", title:"Apresentar para minha audiência", description:"Curadores e criadores podem construir conteúdo, ampliar o alcance e discutir modelos comerciais quando o produto estiver pronto.", action:"Explorar colaboração", href:"/para-educadores/com-audiencia", image:5 },
];

export default function Educadores() {
  return <main className="page"><SiteHeader/><div className="content">
    <section className="page-hero"><span className="section-kicker">COONTO PARA EDUCADORES</span><h1>Escolha como quer usar a experiência.</h1>
      <p>Quando um aluno diz que não está entendendo o livro, comece por uma situação da história. Ele escolhe, levanta uma hipótese e volta ao texto para procurar pistas. Escolha seu objetivo para ver como usar isso com sua turma.</p></section>
    <section className="educator-guides" id="guias"><span className="section-kicker">MATERIAL DE APOIO</span><h2>Entenda o método antes de aplicar</h2><p>Três respostas diretas para compreender o Coonto e levá-lo à aula. Abra o PDF para aprofundar.</p>
      <div className="guide-list"><a href="/guias/Coonto_Para_Educadores_01_Como_Funciona.pdf" target="_blank" rel="noopener">01 · Como funciona? A decisão leva o aluno de volta à obra. Abrir guia →</a>
        <a href="/guias/Coonto_Para_Educadores_02_Quando_Usar.pdf" target="_blank" rel="noopener">02 · Quando usar? Antes, durante ou depois da leitura. Abrir guia →</a>
        <a href="/guias/Coonto_Para_Educadores_03_Uso_em_Aula.pdf" target="_blank" rel="noopener">03 · Como levar à aula? Roteiro e perguntas para a turma. Abrir guia →</a></div>
      <p><a href="/para-educadores/roteiro-de-aula">Leia o roteiro de aula na página →</a> &nbsp; <a href="/professor">Abra o exercício guiado do professor →</a></p>
    </section>
    <div className="educator-paths">{paths.map(path=><article id={path.id} key={path.id} className="educator-path"><CatalogArt index={path.image} className="educator-path-visual"/><div className="educator-path-body"><h2>{path.title}</h2><p>{path.description}</p><a className="button button-primary" href={path.href}>{path.action}</a></div></article>)}</div>

  </div><SiteFooter/></main>;
}
