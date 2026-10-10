import { originalWorks } from '@/lib/original-works';
import {BookOpen,Download,ExternalLink} from 'lucide-react';
export function OriginalBooks() {
  return <section className="dashboard-card" id="livros-originais" aria-labelledby="original-books-title">
    <h2 id="original-books-title">Livros originais gratuitos</h2>
    <p className="original-books-intro">Continue a descoberta no livro. Os textos originais são gratuitos e não exigem uma conta.</p>
    <div className="original-books-grid">{originalWorks.map(work => <article className="original-book" key={work.slug}>
      <BookOpen className="original-book-icon" size={26} aria-hidden="true"/>
      <span className="original-book-format">{work.slug==='o-alienista'?'TEXTO · TXT':'LIVRO · PDF'}</span>
      <h3>{work.title}</h3><p className="original-book-author">{work.author}</p>
      <a className="button button-primary" href={work.href} download={work.external ? undefined : true} target={work.external ? '_blank' : undefined} rel={work.external ? 'noopener noreferrer' : undefined}>{work.external?<ExternalLink size={17}/>:<Download size={17}/>} {work.external?'Abrir livro na fonte':'Baixar livro original'}</a>
      <details className="original-book-source"><summary>Sobre esta edição</summary><p>{work.source}</p>{work.external&&<p>O PDF abre em outra página. Use o botão de download do leitor para salvá-lo.</p>}</details>
    </article>)}</div>
    <p className="original-books-note">Quer salvar as atividades do Coonto? Use “Baixar neste aparelho” dentro da experiência.</p>
  </section>;
}
