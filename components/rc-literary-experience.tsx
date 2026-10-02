"use client";
import {BookOpen, CheckCircle2, CircleHelp, RotateCcw} from "lucide-react";
import {useState} from "react";

export type RcStep={
  stage:string;
  title:string;
  body:string;
  question?:string;
  options?:string[];
  response?:string;
  sourceHref?:string;
  sourceLabel?:string;
};

export function RcLiteraryExperience({title,author,intro,steps}:{title:string;author:string;intro:string;steps:RcStep[]}){
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<Record<number,number>>({});
  const[notes,setNotes]=useState<Record<number,string>>({});
  const[helpOpen,setHelpOpen]=useState(false);
  const step=steps[index];
  const selected=answers[index];
  return <section className="rc-experience">
    <header className="rc-experience-head">
      <div><span className="section-kicker">EXPERIÊNCIA RC</span><h1>{title}</h1><p>{author}</p></div>
      <p className="rc-experience-intro">{intro}</p>
    </header>
    <nav className="rc-stage-list" aria-label="Etapas da experiência">{steps.map((item,i)=><button key={`${item.stage}-${i}`} type="button" aria-current={i===index?"step":undefined} onClick={()=>{setIndex(i);setHelpOpen(false);}}>{i+1}. {item.stage}</button>)}</nav>
    <progress value={index+1} max={steps.length} aria-label={`Etapa ${index+1} de ${steps.length}`}/>
    <div className="rc-step">
      <div className="rc-stage">AGORA VOCÊ ESTÁ → <strong>{step.stage}</strong></div>
      <button type="button" className="button button-outline" aria-expanded={helpOpen} aria-controls="rc-stage-help" onClick={()=>setHelpOpen(open=>!open)}><CircleHelp size={17}/>Ajuda nesta etapa</button>
      {helpOpen&&<aside id="rc-stage-help" className="rc-stage-help"><h3>O que fazer agora</h3><p>{step.question?"Escolha a hipótese ou atitude que você investigaria. Você pode mudar de ideia e comparar as alternativas. A escolha pessoal não recebe nota.":step.sourceHref?"Abra o texto original e procure passagens que sustentem ou compliquem sua interpretação. O link abre em outra aba; sua etapa continua aqui.":"Explique com suas palavras o que você entendeu e depois confira na obra. Registre uma passagem, uma relação ou uma dúvida."}</p><p>Use Anterior, Próximo ou a lista de etapas para explorar o percurso. Ao terminar, volte ao catálogo ou envie sua avaliação.</p></aside>}
      <h2>{step.title}</h2>
      <p>{step.body}</p>
      {step.question&&<><h3>{step.question}</h3><div className="rc-options" role="group" aria-label={step.question}>{step.options?.map((option,i)=><button key={option} type="button" aria-pressed={selected===i} className={selected===i?"selected":""} onClick={()=>setAnswers(a=>({...a,[index]:i}))}><span>{i+1}</span>{option}</button>)}</div></>}
      {selected!==undefined&&step.response&&<div className="rc-response"><CheckCircle2 size={18}/><p>{step.response}</p></div>}
      {step.sourceHref&&<a className="button button-outline" href={step.sourceHref} target="_blank" rel="noopener noreferrer"><BookOpen size={17}/>{step.sourceLabel||"Conferir no texto"}</a>}
      <label className="rc-note" htmlFor="rc-reading-note">Minha hipótese, evidência ou dúvida<textarea id="rc-reading-note" rows={4} maxLength={4000} value={notes[index]||""} onChange={event=>setNotes(current=>({...current,[index]:event.target.value}))} placeholder="Que passagem sustenta sua ideia? O que você revisaria?"/><small>Estas anotações permanecem enquanto esta página estiver aberta. Copie o que quiser guardar antes de sair.</small></label>
      <div className="rc-nav">
        <button className="button button-outline" disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}>Anterior</button>
        <span>{index+1}/{steps.length}</span>
        {index<steps.length-1?<button className="button button-primary" onClick={()=>{setIndex(i=>Math.min(steps.length-1,i+1));setHelpOpen(false);}}>Próximo</button>:<button className="button button-outline" onClick={()=>{setIndex(0);setHelpOpen(false);}}><RotateCcw size={16}/>Revisitar</button>}
      </div>
      {index===steps.length-1&&<p>Você chegou ao fim deste percurso. <a href="/catalogo">Escolher outra experiência</a> · <a href="/pesquisa">Avaliar o Coonto</a></p>}
    </div>
  </section>;
}
