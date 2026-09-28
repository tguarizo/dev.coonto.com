import { BookHeart, GraduationCap, Search } from "lucide-react";
import { PathChoice } from "@/components/path-choice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Leitores() {
  const choices = [
    { icon:<GraduationCap />, title:"Preciso para uma prova", text:"Quero compreender a obra para escola, vestibular ou ENEM — sem depender de decorar um resumo." },
    { icon:<Search />, title:"Li, mas não entendi", text:"Terminei ou comecei a obra, mas personagens, contexto e ideias ainda parecem distantes." },
    { icon:<BookHeart />, title:"Quero viver uma grande história", text:"Quero entrar no universo da obra, decidir, descobrir consequências e encontrar o caminho do autor." },
  ];
  return <main className="page"><SiteHeader /><div className="content"><section className="page-hero"><span className="section-kicker">LEIA COM MAIS CLAREZA</span><h1>Perdeu o fio da história?</h1><p>Entre numa cena, faça uma escolha e descubra pistas sobre os personagens e seus conflitos. Depois procure no livro o que sustenta sua ideia. Você pode usar o Coonto antes, durante ou depois da leitura.</p></section><PathChoice choices={choices} /></div><SiteFooter /></main>;
}
