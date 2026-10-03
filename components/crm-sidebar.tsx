'use client';
import { useEffect,useState } from 'react';
import { usePathname,useSearchParams } from 'next/navigation';
import { LayoutDashboard,Inbox,ClipboardList,Activity,Users,GraduationCap,School,Handshake,KeyRound,Tags,ShieldCheck,CircleHelp,AudioLines,BookOpen,PanelLeftClose,PanelLeftOpen } from 'lucide-react';
const sections=[
 {heading:'Acompanhar',links:[
  {href:'/backoffice',label:'Visão geral',icon:LayoutDashboard},{href:'/backoffice/entradas',label:'Caixa de entrada',icon:Inbox},{href:'/backoffice/pesquisa',label:'Pesquisa',icon:ClipboardList},{href:'/backoffice/atividade',label:'Atividade',icon:Activity}]},
 {heading:'Relacionar',links:[
  {href:'/backoffice/crm?area=relacionamentos',label:'Contatos e parceiros',icon:Users},{href:'/backoffice/crm?area=alunos',label:'Alunos',icon:GraduationCap},{href:'/backoffice/crm?area=organizacoes',label:'Escolas e turmas',icon:School},{href:'/backoffice/parcerias',label:'Indicações e oportunidades',icon:Handshake}]},
 {heading:'Configurar',links:[
  {href:'/backoffice/redes',label:'Redes e contratos',icon:School},{href:'/backoffice/personas',label:'Personas e acessos',icon:KeyRound},{href:'/backoffice#ofertas',label:'Ofertas',icon:Tags},{href:'/backoffice/administradores',label:'Administradores',icon:ShieldCheck},{href:'/backoffice/ajuda',label:'Ajuda Coonto',icon:CircleHelp},{href:'/backoffice/audio',label:'Áudio das obras',icon:AudioLines},{href:'/curadoria/rc',label:'Conteúdo Beta RC',icon:BookOpen}]}];
export function CrmSidebar(){
 const pathname=usePathname(),params=useSearchParams(),[collapsed,setCollapsed]=useState(false),[hash,setHash]=useState('');
 useEffect(()=>{const sync=()=>setHash(window.location.hash);sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[pathname]);
 function current(href:string){const url=new URL(href,'https://coonto.invalid');return pathname===url.pathname&&(url.hash?hash===url.hash:!hash)&&(url.search?(params.get('area')||'relacionamentos')===url.searchParams.get('area'):!params.has('area'));}
 return <aside className={`crm-sidebar${collapsed?' crm-sidebar-collapsed':''}`}><div className="crm-sidebar-top"><div className="crm-sidebar-title">Coonto <span>Administração</span></div><button type="button" className="crm-menu-toggle" onClick={()=>setCollapsed(!collapsed)} aria-expanded={!collapsed} aria-controls="crm-navigation" aria-label={collapsed?'Expandir menu':'Recolher menu'}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}</button></div><nav id="crm-navigation" aria-label="Coonto Administração">{sections.map(group=><div className="crm-sidebar-group" key={group.heading}><strong>{group.heading}</strong>{group.links.map(link=><a key={link.href} href={link.href} title={collapsed?link.label:undefined} aria-label={link.label} aria-current={current(link.href)?'page':undefined}><link.icon size={19} aria-hidden="true"/><span>{link.label}</span></a>)}</div>)}</nav></aside>;
}
