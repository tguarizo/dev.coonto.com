"use client";
import {BookOpen, CheckCircle2, RotateCcw} from "lucide-react";
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
  const step=steps[index];
  const selected=answers[index];
  return <section className="rc-experience">
    <header className="rc-experience-head">
      <div><span className="section-kicker">EXPERIÊNCIA RC</span><h1>{title}</h1><p>{author}</p></div>
      <p className="rc-experience-intro">{intro}</p>
    </header>
    <div className="rc-step">
      <div className="rc-stage">AGORA VOCÊ ESTÁ → <strong>{step.stage}</strong></div>
      <h2>{step.title}</h2>
      <p>{step.body}</p>
      {step.question&&<><h3>{step.question}</h3><div className="rc-options">{step.options?.map((option,i)=><button key={option} className={selected===i?"selected":""} onClick={()=>setAnswers(a=>({...a,[index]:i}))}><span>{i+1}</span>{option}</button>)}</div></>}
      {selected!==undefined&&step.response&&<div className="rc-response"><CheckCircle2 size={18}/><p>{step.response}</p></div>}
      {step.sourceHref&&<a className="button button-outline" href={step.sourceHref} target="_blank" rel="noopener noreferrer"><BookOpen size={17}/>{step.sourceLabel||"Conferir no texto"}</a>}
      <div className="rc-nav">
        <button className="button button-outline" disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}>Anterior</button>
        <span>{index+1}/{steps.length}</span>
        {index<steps.length-1?<button className="button button-primary" onClick={()=>setIndex(i=>Math.min(steps.length-1,i+1))}>Próximo</button>:<button className="button button-outline" onClick={()=>{setIndex(0);setAnswers({});}}><RotateCcw size={16}/>Recomeçar</button>}
      </div>
    </div>
  </section>;
}
