import { getCurrentUser, loginPath, logoutPath } from "@/lib/auth";
import { isCrmHost } from "@/lib/admin-host";
import Link from "next/link";

export async function SiteHeader() {
  const crm = await isCrmHost();
  const user = await getCurrentUser();
  if (crm) return <header className="site-header admin-site-header">
    <Link href="/backoffice" aria-label="Início do CRM Coonto"><img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo" /></Link>
    <nav aria-label="Sessão administrativa"><span>CRM · ADMINISTRAÇÃO</span>{user ? <a href={logoutPath("/login")}>Sair</a> : <a href="/login?return_to=%2Fbackoffice">Entrar</a>}</nav>
  </header>;
  return (
    <header className="site-header">
      <Link href="/" aria-label="Voltar para o início"><img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo" /></Link>
      <nav aria-label="Navegação">
        <a href="/catalogo">Catálogo</a>
        <a className="survey-nav-link" href="/pesquisa">Pesquisa</a>
        <a href="/parceiros">Parceiros</a>
        <a href="/para-educadores">Educadores</a>
        {user ? <><a className="member-nav" href="/minha-biblioteca">Minha biblioteca</a><a className="account-link" href={logoutPath("/")}>Sair</a></> : <a className="button button-coral" href={loginPath("/minha-biblioteca")}>Entrar</a>}
      </nav>
    </header>
  );
}
