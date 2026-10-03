import { getCurrentUser, loginPath, logoutPath } from "@/lib/auth";
import { isCrmHost } from "@/lib/admin-host";
import { getAccessProfile } from "@/lib/access-control";
import Link from "next/link";
import { MobileSiteMenu } from "@/components/mobile-site-menu";

export async function SiteHeader() {
  const crm = await isCrmHost();const user = await getCurrentUser();
  if (crm) return <header className="site-header admin-site-header"><Link href="/backoffice" aria-label="Início do CRM Coonto"><img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo" /></Link><nav aria-label="Sessão administrativa"><span>CRM · ADMINISTRAÇÃO</span><a href="/backoffice/ajuda">Ajuda</a>{user ? <a href={logoutPath("/login")}>Sair</a> : <a href="/login?return_to=%2Fbackoffice">Entrar</a>}</nav></header>;
  const access=user?await getAccessProfile(user):null;
  return <header className="site-header"><Link href="/" aria-label="Voltar para o início"><img src="/images/coonto-logo.png" alt="Coonto" className="brand-logo" /></Link><nav aria-label="Navegação">
    <a href="/catalogo">Catálogo</a><a href="/como-funciona">Como funciona</a><a className="survey-nav-link" href="/pesquisa">Pesquisa</a><a href="/ajuda">Ajuda</a>
    {access?.canUseEducationalCrm&&<a href="/gestao-escolar">Gestão</a>}{access?.personas.includes("educator")&&<a href="/professor">Professor</a>}{access?.canUseCommercialCrm&&<a href="/parceiro-comercial">Parceiro</a>}{access?.canUseCulturalCrm&&<a href="/curadoria">Curadoria</a>}
    {user ? <><a href="/ambientes">Meus ambientes</a><a className="member-nav" href="/minha-biblioteca">Minha biblioteca</a><a className="account-link" href={logoutPath("/")}>Sair</a></> : <a className="button button-coral" href={loginPath("/ambientes")}>Entrar</a>}
  </nav><MobileSiteMenu/></header>;
}
