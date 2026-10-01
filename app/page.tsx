import { HomeLiteraryJourney } from "@/components/home-literary-journey";
import { MobileSiteMenu } from "@/components/mobile-site-menu";

export const dynamic = "force-dynamic";

export default function Home(){
  return <main className="home-shell radical-home">
    <header className="home-header radical-header">
      <img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo"/>
      <nav aria-label="Navegação principal">
        <a href="/catalogo">Catálogo</a>
        <a href="/como-funciona">O que é o Coonto?</a>
        <a href="/para-educadores">Educadores</a>
        <a href="/pesquisa">Pesquisa</a>
        <a href="/login?return_to=%2Fminha-biblioteca">Entrar</a>
      </nav><MobileSiteMenu/>
    </header>
    <HomeLiteraryJourney/>
  </main>;
}
