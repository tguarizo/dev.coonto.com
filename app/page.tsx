import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CoontoVideos } from "@/components/coonto-videos";
import { InstallCoonto } from "@/components/install-coonto";
import { OriginalBooks } from "@/components/original-books";
import { CatalogArt } from "@/components/catalog-art";
import { HomeStoryDemo } from "@/components/home-story-demo";
import { freeWorks } from "@/lib/free-works";
import styles from "./home.module.css";
export const dynamic = "force-dynamic";
export default function Home() {
  return <main className={styles.home}>
    <SiteHeader />
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div><p className={styles.kicker}>LITERATURA PARA DESCOBRIR</p><h1>Ler um clássico pode ser uma aventura.</h1>
          <p className={styles.lead}>Você entra na história, conhece os personagens, faz escolhas e descobre o que acontece. Aos poucos, até os livros mais difíceis começam a fazer sentido.</p>
          <div className={styles.actions}><a className={styles.primary} href="/leitura/o-alienista">Comece por O Alienista →</a><a className={styles.secondary} href="#experimente">Experimente em 30 segundos</a></div>
          <p className={styles.detail}>Gratuito nesta versão · No celular, tablet ou computador</p>
        </div>
        <a href="/obra/o-alienista" className={styles.heroArt} aria-label="Conheça O Alienista"><CatalogArt index={0}/><div><span>MACHADO DE ASSIS</span><strong>Quem é louco<br/>nessa história?</strong><p>Itaguaí espera por você.</p></div></a>
      </section>
      <HomeStoryDemo />
      <section className={styles.section} id="historias" aria-labelledby="stories-title">
        <p className={styles.kicker}>CONHEÇA AS HISTÓRIAS</p><h2 id="stories-title">Uma nova porta para cada livro.</h2>
        <p>Escolha por onde entrar. Cada obra tem seu cenário, seus personagens e suas próprias perguntas.</p>
        <div className={styles.books}>{freeWorks.map(work=><article className={styles.book} key={work.slug}>
          <a href={work.href} aria-label={`Começar ${work.title}`}><CatalogArt index={work.art} className={styles.bookArt}/></a>
          <div className={styles.bookCopy}><span className={styles.kicker}>{work.author}</span><h3>{work.title}</h3><p>{work.slug==="o-alienista"?"Um médico respeitado, uma ideia ambiciosa e uma cidade que começa a fazer perguntas.":work.slug==="memorias-de-martha"?"Martha cresce entre dificuldades, encontros e o desejo de construir seu caminho.":"Perdido numa selva escura, Dante precisa encontrar um caminho. Por onde você começaria?"}</p><a href={work.href} className={styles.bookLink}>Entrar na história →</a></div>
        </article>)}</div>
      </section>
      <section className={styles.explain} aria-labelledby="how-title"><div><p className={styles.kicker}>A HISTÓRIA COMEÇA COM VOCÊ</p><h2 id="how-title">Conheça. Escolha. Descubra.</h2><p>Você acompanha uma situação, forma uma ideia e encontra novas pistas. Pode mudar de opinião e seguir no seu ritmo.</p></div><div><h3>E o livro?</h3><p>Ele continua sendo o centro da experiência. O Coonto ajuda você a chegar ao texto com curiosidade e a voltar a ele para conferir suas descobertas.</p><a href="/como-funciona" className={styles.bookLink}>Conheça o Coonto →</a></div></section>
      <OriginalBooks />
    </div>
    <CoontoVideos />
    <div className={styles.wrap}><InstallCoonto /><section className={styles.feedback}><div><h2>Como foi entrar na história?</h2><p>Sua experiência ajuda a melhorar o Coonto.</p></div><a href="/pesquisa" className={styles.secondary}>Conte para nós →</a></section></div>
    <SiteFooter />
  </main>;
}
