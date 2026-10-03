import { originalWorks } from '@/lib/original-works';
export function OriginalBooks() {
  return <section className="dashboard-card" id="livros-originais" aria-labelledby="original-books-title">
    <h2 id="original-books-title">Livros originais gratuitos</h2>
    <p>Escolha o texto original. Estes arquivos são separados da experiência Coonto e não exigem pedido, assinatura ou licença do aplicativo. O botão “Baixar neste aparelho”, dentro da experiência, salva as atividades para uso offline.</p>
    <div className="rc-catalog-grid">{originalWorks.map(work => <article key={work.slug}>
      <h3>{work.title}</h3><p>{work.author}</p><p>{work.source}</p>
      <a className="button button-primary" href={work.href} download={work.external ? undefined : true} target={work.external ? '_blank' : undefined} rel={work.external ? 'noopener noreferrer' : undefined}>{work.label}</a>
      {work.external && <p>Arquivo externo: abra o PDF e use o botão de download do leitor.</p>}
    </article>)}</div>
  </section>;
}
