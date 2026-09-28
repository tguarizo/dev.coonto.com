"use client";

import { usePathname } from "next/navigation";

const sections = [
  { heading: "Acompanhar", links: [
    { href: "/backoffice", label: "Visão geral" },
    { href: "/backoffice/entradas", label: "Caixa de entrada" },
    { href: "/backoffice/pesquisa", label: "Pesquisa" },
    { href: "/backoffice/atividade", label: "Atividade" },
  ] },
  { heading: "Relacionar", links: [
    { href: "/backoffice/crm?area=relacionamentos", label: "Contatos e parceiros" },
    { href: "/backoffice/crm?area=alunos", label: "Alunos" },
    { href: "/backoffice/crm?area=organizacoes", label: "Escolas e turmas" },
    { href: "/backoffice/parcerias", label: "Indicações e oportunidades" },
  ] },
  { heading: "Configurar", links: [{ href: "/backoffice#ofertas", label: "Ofertas" }] },
];

export function CrmSidebar() {
  const pathname = usePathname();
  return <aside className="crm-sidebar"><div className="crm-sidebar-title">Coonto <span>CRM</span></div><nav aria-label="Áreas do CRM">
    {sections.map(group => <div className="crm-sidebar-group" key={group.heading}><strong>{group.heading}</strong>{group.links.map(link => <a key={link.href} href={link.href} aria-current={!link.href.includes("?") && pathname === link.href.split("#")[0] ? "page" : undefined}>{link.label}</a>)}</div>)}
  </nav></aside>;
}
