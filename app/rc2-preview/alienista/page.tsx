"use client";
import {useState} from "react";
import Link from "next/link";

type Scene={id:string;title:string;context:string;question:string;choices:{label:string;feedback:string}[];discovery:string;source:string};
const scenes:Scene[]=[
{id:"chegada",title:"Conheça o doutor",context:"Estamos em Itaguaí. Simão Bacamarte é um médico respeitado, formado na Europa. Para ele, a ciência é uma grande paixão.",question:"O que parece mais importante para Bacamarte neste começo?",choices:[
{label:"Investigar e compreender pela ciência.",feedback:"Essa é a ideia que move Bacamarte. Mas o que acontece quando alguém confia demais no próprio método?"},
{label:"Conquistar imediatamente um cargo político.",feedback:"Não é assim que Machado apresenta a motivação inicial do médico. A influência dele sobre a cidade aparecerá de outras formas."},
{label:"Ter uma vida sossegada, longe de preocupações.",feedback:"O doutor não parece desejar sossego. Seu projeto é muito mais ambicioso."}
],discovery:"Bacamarte coloca a ciência no centro da vida. O que ainda não sabemos é até onde ele vai aplicar esse pensamento.",source:"Capítulo I"},
{id:"casamento",title:"O doutor vai se casar",context:"Bacamarte escolhe D. Evarista para se casar. Mas sua decisão leva em conta características que ele julga adequadas para ter filhos.",question:"Que hipótese essa escolha sugere sobre o modo como ele pensa?",choices:[
{label:"Até a vida pessoal pode ser tratada por critérios científicos.",feedback:"Há indícios disso na decisão do médico. Machado deixa espaço para perceber o contraste entre sentimentos e cálculos."},
{label:"Ele pretende impressionar a cidade com uma cerimônia.",feedback:"O episódio não sustenta essa como a principal razão. Observe os critérios usados por ele."},
{label:"Ele deixou a medicina para se dedicar à família.",feedback:"Pelo contrário: seu raciocínio científico aparece até na escolha da esposa."}
],discovery:"Uma escolha aparentemente privada mostra como o método de Bacamarte atravessa diferentes aspectos da vida.",source:"Capítulo I"}
];
export default function AlienistaRc2(){
 const [index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[help,setHelp]=useState(false),[notes,setNotes]=useState<Record<string,string>>({}),[showDiscovery,setShowDiscovery]=useState(false);
 const scene=scenes[index];const done=showDiscovery&&index===scenes.length-1;
 function next(){if(index<scenes.length-1){setIndex(v=>v+1);setChoice(null);setShowDiscovery(false);setHelp(false);}}
 return <main style={{minHeight:"100vh",background:"#f5f6fa",color:"#172033",fontFamily:"system-ui,sans-serif",padding:"24px"}}>
  <div style={{maxWidth:900,margin:"0 auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center"}}>
    <Link href="/rc2-preview" style={{color:"#172033",fontWeight:700}}>← Voltar à prévia</Link>
    <span style={{fontSize:12,color:"#5f6d8a"}}>CLE RC2 • Protótipo editorial</span>
   </header>
   <div style={{marginTop:32,display:"flex",gap:20,flexWrap:"wrap"}}>
    <aside style={{flex:"1 1 200px",maxWidth:260}}>
     <p style={{fontSize:12,letterSpacing:2,fontWeight:700}}>SUA LEITURA</p>
     <h2>O Alienista</h2>
     <p>Fase 1 · O experimento</p>
     <p aria-live="polite">Cena {index+1} de {scenes.length}</p>
     <button type="button" onClick={()=>setHelp(v=>!v)} style={{border:"1px solid #b9c5dc",padding:12,background:"#fff",borderRadius:10,cursor:"pointer"}}>{help?"Fechar contexto":"Quem é quem? Preciso de ajuda"}</button>
     {help&&<div style={{padding:14,background:"#e9ecfb",marginTop:8,borderRadius:10,fontSize:14,lineHeight:1.6}}><strong>Para se situar</strong><p>Itaguaí é a cidade onde se passa a história. Simão Bacamarte é um médico que quer estudar a mente humana. D. Evarista é sua esposa. Outros personagens aparecerão quando entrarem na narrativa.</p></div>}
     <p style={{fontSize:13,marginTop:25}}>Ler mais sobre a obra?</p>
     <Link href="/texto/o-alienista">Consultar o texto original</Link>
    </aside>
    <section style={{flex:"3 1 440px",background:"#fff",padding:"clamp(20px,4vw,36px)",borderRadius:18,border:"1px solid #dce1ed"}}>
     <p style={{fontSize:12,color:"#5f6d8a",letterSpacing:1.5,fontWeight:700}}>ITAGUAÍ • {scene.source}</p>
     <h1 style={{fontSize:"clamp(1.9rem,4vw,2.8rem)",margin:"12px 0"}}>{scene.title}</h1>
     <p style={{fontSize:18,lineHeight:1.7}}>{scene.context}</p>
     <h2 style={{fontSize:20,marginTop:32}}>{scene.question}</h2>
     <div role="group" aria-label="Escolha uma hipótese" style={{display:"grid",gap:10}}>
      {scene.choices.map((option,i)=><button key={i} type="button" onClick={()=>{setChoice(i);setShowDiscovery(false);}} aria-pressed={choice===i} style={{padding:15,textAlign:"left",fontSize:16,cursor:"pointer",background:choice===i?"#ede8ff":"#fafbfd",border:choice===i?"2px solid #5d48a5":"1px solid #cdd6e4",borderRadius:10}}>{option.label}</button>)}
     </div>
     {choice!==null&&<div style={{background:"#eff2fc",padding:20,marginTop:18,borderRadius:12}} role="status"><strong>Vamos olhar sua ideia</strong><p style={{lineHeight:1.7}}>{scene.choices[choice].feedback}</p><button type="button" onClick={()=>setShowDiscovery(true)} style={{background:"#172033",color:"#fff",border:0,borderRadius:8,padding:"12px 16px",cursor:"pointer"}}>Ver o que descobrimos</button></div>}
     {showDiscovery&&<div style={{padding:18,borderLeft:"4px solid #6b59b4",marginTop:20}}><strong>Uma descoberta</strong><p>{scene.discovery}</p>{!done?<button type="button" onClick={next} style={{background:"#172033",color:"#fff",border:0,borderRadius:8,padding:"12px 16px",cursor:"pointer"}}>Continuar a história →</button>:<p><strong>Fim deste protótipo da abertura.</strong> O restante da obra continua preservado na versão atual.</p>}</div>}
     <label htmlFor="rc2-note" style={{display:"block",fontWeight:700,marginTop:30}}>Minha descoberta ou dúvida (opcional)</label>
     <textarea id="rc2-note" value={notes[scene.id]||""} onChange={e=>setNotes(p=>({...p,[scene.id]:e.target.value}))} rows={3} placeholder="Escreva com suas palavras…" style={{display:"block",width:"100%",boxSizing:"border-box",padding:12,marginTop:8,border:"1px solid #b9c5dc",borderRadius:8}}/>
     <p style={{fontSize:12,color:"#5f6d8a"}}>Protótipo isolado. Anotações não são enviadas ao servidor e serão perdidas ao sair.</p>
    </section>
   </div>
  </div>
 </main>;
}
