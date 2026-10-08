"use client";

import { useState } from "react";
import Link from "next/link";

const options = [
  { label: "A cidade acredita que a ciência pode ajudar.", response: "É uma hipótese possível. Para parte da cidade, o conhecimento do médico parece uma promessa. Mas confiança e poder nem sempre caminham juntos." },
  { label: "Ninguém se sente à vontade para contrariar o médico.", response: "Outra hipótese possível. A reputação de Bacamarte pesa na maneira como os moradores recebem suas ideias. Vamos descobrir como essa relação evolui." },
  { label: "Alguns moradores têm dúvidas sobre o plano.", response: "Uma dúvida pode abrir uma boa história: nem todos precisam enxergar o mesmo acontecimento do mesmo jeito. O que a obra contará?" },
];

export default function Rc2Preview() {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <main style={{minHeight:"100vh",background:"#f6f7fb",color:"#172033",fontFamily:"system-ui, sans-serif"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"24px"}}>
        <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <Link href="/" style={{color:"#172033",fontWeight:800,textDecoration:"none",fontSize:24}}>coonto</Link>
          <span style={{fontSize:12,background:"#e8e9f2",padding:"8px 12px",borderRadius:99}}>Protótipo RC2 · uso interno · não publicado</span>
        </header>
        <section style={{padding:"70px 0 50px",maxWidth:740}}>
          <p style={{letterSpacing:2,fontWeight:700,color:"#5f6d8a"}}>LITERATURA PARA DESCOBRIR</p>
          <h1 style={{fontSize:"clamp(2.3rem, 6vw, 4.5rem)",lineHeight:1.12,fontWeight:800,margin:"16px 0"}}>Ler um clássico pode ser uma aventura.</h1>
          <p style={{fontSize:"clamp(1rem, 2.7vw, 1.35rem)",lineHeight:1.6}}>Você entra na história, conhece os personagens, faz escolhas e descobre o que acontece. Aos poucos, até os livros mais difíceis começam a fazer sentido.</p>
          <a href="#experimente" style={{display:"inline-block",background:"#172033",color:"#fff",padding:"14px 24px",borderRadius:10,marginTop:16,textDecoration:"none"}}>Experimente em 30 segundos</a>
        </section>
        <section id="experimente" style={{background:"#fff",border:"1px solid #d9dfe9",borderRadius:18,padding:"clamp(20px, 5vw, 44px)",boxShadow:"0 12px 32px #1720330b"}}>
          <p style={{fontSize:12,fontWeight:700,letterSpacing:1.5,color:"#5f6d8a"}}>O ALIENISTA · MACHADO DE ASSIS</p>
          <h2 style={{fontSize:"clamp(1.7rem, 4vw, 2.5rem)",margin:"12px 0"}}>Um médico quer entender a loucura.</h2>
          <p style={{lineHeight:1.65}}>Em Itaguaí, Simão Bacamarte quer estudar a mente humana. Ele é respeitado por seu conhecimento, mas uma ideia ambiciosa pode mudar a rotina de toda a cidade.</p>
          <h3 style={{marginTop:30,fontSize:"1.15rem"}}>Como você imagina que os moradores reagiriam?</h3>
          <div style={{display:"grid",gap:10,marginTop:14}}>
            {options.map((option,index)=><button type="button" key={index} onClick={()=>setChoice(index)} aria-pressed={choice===index} style={{padding:"15px 16px",textAlign:"left",borderRadius:12,border:choice===index?"2px solid #6957a9":"1px solid #cdd5e0",background:choice===index?"#f3f0ff":"#fff",color:"#172033",cursor:"pointer",fontSize:"1rem"}}>{option.label}</button>)}
          </div>
          {choice!==null&&<div role="status" style={{padding:20,marginTop:20,background:"#eef3ff",borderRadius:12}}>
            <strong>Uma ideia para acompanhar</strong>
            <p style={{lineHeight:1.6}}>{options[choice].response}</p>
            <p>Quer descobrir o que Machado de Assis escreveu?</p>
            <Link href="/catalogo" style={{color:"#39318f",fontWeight:700}}>Conheça as obras →</Link>
          </div>}
          <p style={{fontSize:12,color:"#5f6d8a",marginTop:20}}>Demonstração ilustrativa para validação editorial, não uma reprodução definitiva do enredo. Não salva respostas.</p>
        </section>
        <section style={{padding:"40px 0 20px"}}>
          <h2>Outras histórias para explorar</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:14}}>
            {[["O Alienista","Machado de Assis"],["Memórias de Martha","Júlia Lopes de Almeida"],["A Divina Comédia","Dante Alighieri"]].map(([title,author])=>
              <Link key={title} href="/catalogo" style={{border:"1px solid #d9dfe9",borderRadius:12,padding:24,background:"#fff",color:"#172033",textDecoration:"none"}}>
                <strong style={{display:"block",fontSize:19}}>{title}</strong><span style={{color:"#5f6d8a"}}>{author}</span>
              </Link>
            )}
          </div>
        </section>
        <footer style={{padding:"24px 0",color:"#5f6d8a",fontSize:13}}>Coonto RC2 · prévia isolada. O site em produção e o ambiente dev continuam inalterados.</footer>
      </div>
    </main>
  );
}
