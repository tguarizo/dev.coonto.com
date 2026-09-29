"use client";

import { useEffect, useRef, useState } from "react";
import scenes from "@/content/o-alienista-scenes.json";
import { CoontoHelp } from "@/components/coonto-help";
import { ALIENISTA_SCENES } from "@/lib/works";

type Bookmark = { id:string; scene_id:string; title:string };

const guidedExercise = [
  { verb:"Observar", scene:"s19", prompt:"Quem contesta Bacamarte? Separe o fato narrado da impressão da turma." },
  { verb:"Interpretar", scene:"s20", prompt:"Que mudança de escala a revolta revela? Peça duas leituras possíveis." },
  { verb:"Provar", scene:"s21", prompt:"Que detalhe sustenta ou complica a relação entre ciência e poder?" },
  { verb:"Conectar", scene:"s24", prompt:"Compare a pauta da revolta com o discurso após a vitória." },
  { verb:"Lembrar", scene:"s26", prompt:"Depois de um intervalo, explique a relação sem rever a cena." },
];

export function TeacherWorkspace() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [selected,setSelected] = useState("s0");
  const [bookmarks,setBookmarks] = useState<Bookmark[]>([]);
  const [title,setTitle] = useState("");
  const [status,setStatus] = useState("");
  const [ready,setReady] = useState(false);

  useEffect(()=>{
    void fetch("/api/teacher/bookmarks").then(r=>r.ok?r.json():Promise.reject()).then(data=>setBookmarks(data.bookmarks)).catch(()=>setStatus("Não foi possível carregar suas marcações."));
  },[]);

  function jump(id:string) {
    setSelected(id);
    if (!ready) return;
    iframe.current?.contentWindow?.postMessage({type:"coonto:teacher-jump",sceneId:id},location.origin);
    iframe.current?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  async function addBookmark(event:React.FormEvent) {
    event.preventDefault();
    try {
      const response=await fetch("/api/teacher/bookmarks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sceneId:selected,title})});
      if(!response.ok)throw new Error();
      const data=await response.json() as {bookmark:Bookmark};
      setBookmarks(items=>[data.bookmark,...items]);setTitle("");setStatus("Marcação salva na sua conta.");
    } catch {setStatus("Não foi possível salvar a marcação. Tente novamente.");}
  }
  async function removeBookmark(id:string) {
    try {
      const response=await fetch(`/api/teacher/bookmarks?id=${encodeURIComponent(id)}`,{method:"DELETE"});
      if(!response.ok)throw new Error();
      setBookmarks(items=>items.filter(item=>item.id!==id));
    } catch {setStatus("Não foi possível remover a marcação.");}
  }
  return <div className="teacher-layout">
    <aside className="teacher-panel">
      <section className="teacher-exercise" aria-labelledby="teacher-exercise-heading">
        <h2 id="teacher-exercise-heading">Exercício guiado · Revolta dos Canjicas</h2>
        <p>Roteiro do guia pedagógico: faça as escolhas na prévia e peça que a turma justifique cada resposta com a obra. Você pode retomar cada etapa sem recomeçar.</p>
        <ol>{guidedExercise.map(step=><li key={step.verb}><button type="button" onClick={()=>jump(step.scene)}><strong>{step.verb}</strong> · abrir cena</button><span>{step.prompt}</span></li>)}</ol>
        <p><a href="/texto/o-alienista#capitulo-vi" target="_blank" rel="noopener noreferrer">Abrir o capítulo VI de Machado ↗</a> · <a href="/guias/Coonto_Para_Educadores_03_Uso_em_Aula.pdf" target="_blank" rel="noopener noreferrer">Guia 03 completo (PDF) ↗</a></p>
      </section>
      <h2>Pontos sugeridos</h2><p>Escolha uma cena para discutir. As cenas posteriores podem revelar acontecimentos da obra.</p>
      <div className="teacher-scene-list">{ALIENISTA_SCENES.map(scene=><button type="button" key={scene.id} onClick={()=>jump(scene.id)}>
        <strong>{scene.label}</strong><small>Cap. {scene.chapter} · {scene.phase}{scene.spoiler?" · contém revelações":""}</small>
      </button>)}</div>
      <h2>Suas marcações</h2><p>Você também pode marcar qualquer uma das {scenes.length} cenas.</p>
      <label htmlFor="teacher-scene">Cena</label><select id="teacher-scene" value={selected} onChange={event=>jump(event.target.value)}>
        {scenes.map(scene=><option key={scene.id} value={scene.id}>{scene.phase} · {scene.title}</option>)}
      </select>
      <form onSubmit={addBookmark}><label htmlFor="teacher-title">Nome da sua marcação</label><input id="teacher-title" value={title} onChange={event=>setTitle(event.target.value)} maxLength={100} required placeholder="Ex.: debate sobre autoridade"/><button className="button button-primary">Salvar marcação</button></form>
      {bookmarks.map(bookmark=><div className="teacher-bookmark" key={bookmark.id}><button type="button" onClick={()=>jump(bookmark.scene_id)}>{bookmark.title}</button><button type="button" onClick={()=>void removeBookmark(bookmark.id)} aria-label={`Remover ${bookmark.title}`}>Remover</button></div>)}
      {status&&<p role="status">{status}</p>}
      <p><a href="/minha-biblioteca">Ir para minha leitura pessoal</a></p>
    </aside>
    <div className="teacher-reader"><details className="teacher-help"><summary>Apoio ao professor · preparar uma atividade</summary><CoontoHelp initialMode="teacher" sceneId={selected}/></details><p><strong>Prévia para aula.</strong> Responda às perguntas da experiência, avance entre elas ou salte pelo roteiro. Suas escolhas aqui não mudam o progresso da leitura pessoal.</p>
      <iframe ref={iframe} onLoad={()=>{setReady(true);iframe.current?.contentWindow?.postMessage({type:"coonto:teacher-jump",sceneId:selected},location.origin);}} title="O Alienista — prévia do professor" src="/api/works/o-alienista?mode=teacher" className="experience-frame" allow="autoplay"/>
    </div>
  </div>;
}
