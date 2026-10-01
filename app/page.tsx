import { HomeLiteraryJourney } from "@/components/home-literary-journey";
import { MobileSiteMenu } from "@/components/mobile-site-menu";
import { COONTO_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

export default function Home(){
  return <main className="home-shell radical-home" id="inicio">
    <header className="home-header radical-header">
      <a href="#inicio" className="home-brand" aria-label="Voltar ao início">
        <img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo"/>
        <span>plataforma de aprendizagem interativa</span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="/catalogo">Catálogo</a>
        <a href="/como-funciona">O que é o Coonto?</a>
        <a href="/para-educadores">Educadores</a>
        <a href="/pesquisa">Pesquisa</a>
        <a href="/login?return_to=%2Fminha-biblioteca">Entrar</a>
      </nav><MobileSiteMenu/>
    </header>
    <HomeLiteraryJourney/>
    <footer className="home-version-footer">Coonto v{COONTO_VERSION}</footer>
  </main>;
}
