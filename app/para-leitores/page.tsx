import { BookHeart, GraduationCap, Search } from "lucide-react";
import { PathChoice } from "@/components/path-choice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Leitores() {
  const choices = [
    { icon:<GraduationCap />, title:"Preciso para uma prova", text:"Quero compreender e lembrar a obra para escola, vestibular ou ENEM — sem depender de decorar um resumo." },
    { icon:<Search />, title:"Li, mas não entendi", text:"Quero revisitar os conflitos principais, tomar decisões e comparar minhas escolhas com o caminho do autor." },
    { icon:<BookHeart />, title:"Quero viver uma grande história", text:"Quero entrar no universo da obra, decidir antes do personagem e descobrir as consequências." },
  ];
  return <main className="page"><SiteHeader /><div className="content"><section className="page-hero"><span className="section-kicker">VOCÊ NÃO PRECISA COMEÇAR SABENDO EXPLICAR</span><h1>Primeiro, decida.</h1><p>O Coonto coloca você diante de uma situação da obra. Você escolhe o que faria, vê a consequência e depois descobre o caminho do autor. Não precisa de professor, turma ou debate para começar. Você pode usar antes, durante ou depois da leitura.</p></section><PathChoice choices={choices} /></div><SiteFooter /></main>;
}
