"use client";
import { useState } from "react";
import styles from "@/app/home.module.css";

const options = [
  {label:"A cidade acredita que a ciência pode ajudar.",response:"É uma hipótese possível. Para parte da cidade, o conhecimento do médico parece uma promessa. Mas confiança e poder nem sempre caminham juntos."},
  {label:"Ninguém se sente à vontade para contrariar o médico.",response:"Outra hipótese possível. A reputação de Bacamarte pesa na maneira como os moradores recebem suas ideias. Vamos descobrir como essa relação evolui."},
  {label:"Alguns moradores têm dúvidas sobre o plano.",response:"Uma dúvida pode abrir uma boa história: nem todos precisam enxergar o mesmo acontecimento do mesmo jeito. O que a obra contará?"},
];
export function HomeStoryDemo(){
  const [choice,setChoice]=useState<number|null>(null);
  return <section className={styles.demo} id="experimente" aria-labelledby="demo-title">
    <div className={styles.demoHeading}><p className={styles.kicker}>EXPERIMENTE EM 30 SEGUNDOS</p><span>O Alienista · Machado de Assis</span></div>
    <h2 id="demo-title">Um médico quer entender a loucura.</h2>
    <p>Em Itaguaí, Simão Bacamarte quer estudar a mente humana. Ele é respeitado por seu conhecimento, mas uma ideia ambiciosa pode mudar a rotina de toda a cidade.</p>
    <h3>Como você imagina que os moradores reagiriam?</h3>
    <div className={styles.choices} role="group" aria-label="Escolha uma hipótese">{options.map((option,index)=><button key={option.label} type="button" aria-pressed={choice===index} onClick={()=>setChoice(index)}><span aria-hidden="true">{String.fromCharCode(65+index)}</span>{option.label}</button>)}</div>
    {choice!==null&&<div className={styles.discovery} role="status"><strong>Uma ideia para acompanhar</strong><p>{options[choice].response}</p><a className={styles.bookLink} href="/leitura/o-alienista">Descubra o que Machado escreveu →</a></div>}
    <p className={styles.demoHint}>Aqui você imagina uma reação. Na história, encontra as pistas para conferir sua ideia.</p>
  </section>;
}
