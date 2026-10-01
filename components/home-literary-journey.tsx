"use client";

import { ArrowDown, ArrowRight, BookOpenCheck, Brain, Compass, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CatalogArt } from "@/components/catalog-art";

type WorkKey = "alienista" | "dom-casmurro" | "divina-comedia";
type Choice = { id:string; label:string; consequence:string };

const works: Array<{
  key:WorkKey; eyebrow:string; title:string; author:string; image:number; prompt:string;
  choices:Choice[]; authorPath:string; comment:string; next?:string;
}> = [
  {
    key:"alienista", eyebrow:"EXPERIÊNCIA 01 · O ALIENISTA", title:"O Alienista", author:"Machado de Assis", image:0,
    prompt:"Itaguaí começa a reagir à Casa Verde. Se você estivesse no lugar de Bacamarte, o que faria?",
    choices:[
      {id:"A",label:"Recuaria e reveria as internações",consequence:"Você reduz a pressão sobre a cidade, mas enfraquece a autoridade do método que criou."},
      {id:"B",label:"Manteria os critérios",consequence:"Você preserva a lógica do método. A tensão cresce porque a cidade continua submetida a uma regra difícil de contestar."},
      {id:"C",label:"Ampliaria as internações",consequence:"A decisão radicaliza o conflito: quanto mais gente é considerada fora da norma, mais frágil fica a ideia de normalidade."},
    ],
    authorPath:"Machado leva Bacamarte a desconfiar do próprio critério e a inverter a lógica da Casa Verde.",
    comment:"Ao decidir antes de Bacamarte, você percebe com mais força o conflito entre ciência, poder e loucura. É a comparação entre a sua escolha e a de Machado que transforma interpretação em experiência.",
    next:"Dom Casmurro"
  },
  {
    key:"dom-casmurro", eyebrow:"EXPERIÊNCIA 02 · DOM CASMURRO", title:"Dom Casmurro", author:"Machado de Assis", image:1,
    prompt:"Você começa a desconfiar de alguém que ama, mas não tem uma prova definitiva. O que faz?",
    choices:[
      {id:"A",label:"Confia e segue em frente",consequence:"Você preserva a relação, mas aceita conviver com a incerteza."},
      {id:"B",label:"Observa em silêncio",consequence:"A dúvida cresce por dentro. Cada gesto passa a parecer uma possível pista."},
      {id:"C",label:"Confronta imediatamente",consequence:"Você força uma resposta, mas corre o risco de transformar suspeita em certeza antes de ter evidências."},
    ],
    authorPath:"Machado não oferece uma prova conclusiva. Ele nos prende à memória e ao ponto de vista de Bentinho.",
    comment:"Quando você precisa agir sem certeza, sente na prática o mecanismo central do romance: a ambiguidade. O Coonto não resolve a dúvida por você; faz você experimentar por que ela importa.",
    next:"A Divina Comédia"
  },
  {
    key:"divina-comedia", eyebrow:"EXPERIÊNCIA 03 · A DIVINA COMÉDIA", title:"A Divina Comédia", author:"Dante Alighieri", image:15,
    prompt:"Você se vê perdido diante de um caminho escuro e desconhecido. Como decide avançar?",
    choices:[
      {id:"A",label:"Recua e procura outro caminho",consequence:"Você evita o risco imediato, mas continua sem atravessar aquilo que precisa compreender."},
      {id:"B",label:"Segue sozinho",consequence:"Você preserva sua autonomia, mas entra em um território cujo sentido ainda não consegue ler."},
      {id:"C",label:"Aceita a orientação de um guia",consequence:"Você abre mão de parte do controle para atravessar um mundo que exige interpretação e aprendizagem."},
    ],
    authorPath:"Dante aceita Virgílio como guia e inicia uma travessia em que cada encontro revela uma consequência moral e humana.",
    comment:"Ao escolher como atravessar o desconhecido, uma obra distante deixa de ser apenas um monumento literário. Ela vira uma jornada que você consegue relacionar com uma decisão concreta.",
  }
];

export function HomeLiteraryJourney(){
  const [answers,setAnswers]=useState<Record<WorkKey,string|undefined>>({});
  const [active,setActive]=useState<WorkKey>("alienista");
  const selectedWork=useMemo(()=>works.find(w=>w.key===active)!,[active]);

  function choose(work:WorkKey,id:string){setAnswers(prev=>({...prev,[work]:id}));}
  function goNext(index:number){const next=works[index+1];if(!next)return;setActive(next.key);requestAnimationFrame(()=>document.getElementById(next.key)?.scrollIntoView({behavior:"smooth",block:"start"}));}

  return <div className="home-journey">
    <section className="journey-intro">
      <img src="/images/coonto-logo.png" alt="Coonto" className="journey-logo"/>
      <span className="journey-category">plataforma de aprendizagem interativa</span>
      <h1>Entre na história.<br/><em>Decida.</em><br/>Descubra o caminho do autor.</h1>
      <p><strong>O Coonto transforma grandes obras em experiências de decisão.</strong> Você entra em uma situação da história, escolhe o que faria, vê as consequências e compara sua escolha com o caminho seguido pelo autor.</p>
      <a href="#alienista" className="journey-start">Experimente em três obras <ArrowDown size={18}/></a>
    </section>

    {works.map((work,index)=>{
      const answerId=answers[work.key];
      const answer=work.choices.find(c=>c.id===answerId);
      return <section key={work.key} id={work.key} className={`literary-screen literary-${work.key} ${active===work.key?"is-active":""}`}>
        <CatalogArt index={work.image} className="literary-screen-art"/>
        <div className="literary-screen-shade"/>
        <div className="literary-screen-content">
          <div className="literary-heading">
            <span>{work.eyebrow}</span>
            <h2>{work.title}</h2>
            <p>{work.author}</p>
          </div>
          <div className="literary-play">
            <span className="literary-step">ENTRE NA SITUAÇÃO</span>
            <h3>{work.prompt}</h3>
            {!answer ? <div className="literary-options" role="group" aria-label={`Escolhas em ${work.title}`}>
              {work.choices.map(choice=><button key={choice.id} type="button" onClick={()=>choose(work.key,choice.id)}><b>{choice.id}</b><span>{choice.label}</span></button>)}
            </div>:
            <div className="literary-reveal" aria-live="polite">
              <span className="literary-step">SUA ESCOLHA</span>
              <strong>{answer.id} · {answer.label}</strong>
              <p>{answer.consequence}</p>
              <div className="literary-author">
                <span className="literary-step">O CAMINHO DO AUTOR</span>
                <strong>{work.authorPath}</strong>
              </div>
              <div className="literary-comment">
                <Sparkles size={18}/>
                <div><small>COMENTÁRIO COONTO</small><p>{work.comment}</p></div>
              </div>
              <div className="literary-actions">
                <button type="button" className="literary-reset" onClick={()=>setAnswers(prev=>({...prev,[work.key]:undefined}))}><RotateCcw size={16}/>Escolher novamente</button>
                {work.next ? <button type="button" className="literary-next" onClick={()=>goNext(index)}>Próxima obra: {work.next} <ArrowRight size={17}/></button>:
                <a className="literary-next" href="#entenda-o-coonto">Agora entenda o Coonto <ArrowDown size={17}/></a>}
              </div>
            </div>}
          </div>
          <div className="literary-progress" aria-label="Progresso nas três experiências">
            {works.map((item,i)=><span key={item.key} className={answers[item.key]?"done":item.key===work.key?"current":""}>{i+1}</span>)}
          </div>
        </div>
      </section>
    })}

    <section id="entenda-o-coonto" className="coonto-after-journey">
      <span className="section-kicker">AGORA VOCÊ JÁ EXPERIMENTOU</span>
      <h2>Isso é o Coonto.</h2>
      <p className="after-lead">Uma plataforma de aprendizagem interativa que transforma obras literárias em experiências de decisão para ajudar o leitor a compreender, conectar e lembrar melhor o que leu.</p>
      <div className="after-grid">
        <article><Compass size={28}/><h3>O que é</h3><p>Uma plataforma digital de aprendizagem interativa. Não é resumo, curso ou plataforma de debate.</p></article>
        <article><BookOpenCheck size={28}/><h3>Como funciona</h3><p>Você entra na situação, decide, vê uma consequência e descobre o caminho seguido pelo autor.</p></article>
        <article><Brain size={28}/><h3>O que acontece depois</h3><p>A diferença entre sua escolha e a obra cria curiosidade, contexto e memória. O professor pode aprofundar depois — mas não é requisito.</p></article>
      </div>
      <div className="after-method"><strong>Decidir → Descobrir → Entender → Lembrar</strong><span>Encontre o caminho do autor.</span></div>
      <div className="after-actions"><a className="button button-primary" href="/obra/o-alienista">Entrar em O Alienista</a><a className="button button-outline" href="/catalogo">Ver catálogo</a><a className="button button-outline" href="/como-funciona">Como funciona</a></div>
    </section>
  </div>
}
