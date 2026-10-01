"use client";
import { BookOpen, CircleHelp, Download, Library, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CoontoHelp } from "@/components/coonto-help";
export function ExperienceFrame({ userId }: { userId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingRef = useRef<{ state: unknown; percent: number } | null>(null);
  const [status, setStatus] = useState("Seu progresso é salvo automaticamente.");
  const [preparing, setPreparing] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sceneId, setSceneId] = useState("s0");
  const pendingKey = `coonto-pending-${userId}`;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let syncing = false; let alive = true;
    try { pendingRef.current = JSON.parse(localStorage.getItem(pendingKey) || "null"); } catch {}
    const synchronize = async () => {
      const pending = pendingRef.current;
      if (!pending || syncing || !navigator.onLine) return;
      syncing = true;
      try {
        const response = await fetch("/api/progress", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pending) });
        if (!response.ok) throw new Error();
        if (pendingRef.current === pending) { pendingRef.current = null; localStorage.removeItem(pendingKey); }
        if (alive) setStatus("Progresso sincronizado com sua conta.");
      } catch { if (alive) setStatus("Progresso guardado neste aparelho. Tentaremos sincronizar novamente."); }
      finally { syncing = false; }
      if (pendingRef.current && pendingRef.current !== pending) void synchronize();
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "coonto:help") { setHelpOpen(true); return; }
      if (event.data?.type !== "coonto:progress") return;
      const state = event.data.state;
      setSceneId(`s${state.idx}`);
      pendingRef.current = {state,percent:event.data.percent};
      try { localStorage.setItem(pendingKey,JSON.stringify(pendingRef.current)); } catch { setStatus("O armazenamento deste aparelho está cheio. Mantenha a conexão para salvar."); }
      clearTimeout(timer);
      timer=setTimeout(()=>{if(!navigator.onLine)setStatus("Progresso guardado neste aparelho. Será sincronizado quando houver internet.");void synchronize();},500);
    };
    const flush=()=>{if(pendingRef.current&&navigator.onLine)navigator.sendBeacon("/api/progress",new Blob([JSON.stringify(pendingRef.current)],{type:"application/json"}));};
    window.addEventListener("message",receive);window.addEventListener("online",synchronize);window.addEventListener("pagehide",flush);void synchronize();
    if("caches" in window)void caches.open("coonto-protected-v2").then(cache=>cache.match("/offline/o-alienista.html")).then(response=>{if(alive)setOfflineReady(Boolean(response&&response.headers.get("X-Coonto-User")===userId&&Date.parse(response.headers.get("X-Coonto-Expires")||"")>Date.now()));if(response&&response.headers.get("X-Coonto-User")!==userId)void caches.delete("coonto-protected-v2");});
    return()=>{alive=false;clearTimeout(timer);flush();window.removeEventListener("message",receive);window.removeEventListener("online",synchronize);window.removeEventListener("pagehide",flush);};
  },[pendingKey,userId]);
  async function prepareOffline(){
    setPreparing(true);setStatus("Preparando a obra e o texto original neste aparelho…");
    try{
      if(!("serviceWorker" in navigator)||!("caches" in window))throw new Error("Este navegador não oferece armazenamento offline. Use uma versão atual do Chrome, Edge ou Safari.");
      let deviceId=localStorage.getItem("coonto-device-id");if(!deviceId){deviceId=crypto.randomUUID();localStorage.setItem("coonto-device-id",deviceId);}
      const response=await fetch("/api/offline-license",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({deviceId,label:/Android|iPhone|iPad/i.test(navigator.userAgent)?"Celular ou tablet":"Computador"})});
      const license=await response.json();if(!response.ok||!license.expiresAt)throw new Error(license.error||"Não foi possível autorizar o aparelho.");
      await navigator.serviceWorker.register("/sw.js");
      await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error("A preparação demorou. Recarregue e tente novamente.")),15000))]);
      const work=await fetch("/api/works/o-alienista");if(!work.ok)throw new Error("Não foi possível baixar a obra.");
      const cache=await caches.open("coonto-protected-v2");
      const shell=await fetch("/offline/reader.html");const text=await fetch("/offline/texto-o-alienista.html");
      if(!shell.ok||!text.ok)throw new Error("Não foi possível preparar todos os arquivos. Tente novamente.");
      await cache.put("/offline/reader.html",shell);await cache.put("/offline/texto-o-alienista.html",text);
      const audioList=await fetch("/api/audio/o-alienista");if(audioList.ok){const available=await audioList.json() as {scenes:string[]};for(const id of available.scenes){const audio=await fetch(`/api/audio/o-alienista/${id}`);if(!audio.ok)throw new Error("Não foi possível salvar todos os áudios. Tente novamente.");await cache.put(`/api/audio/o-alienista/${id}`,audio);}}
      await cache.put("/offline/o-alienista.html",new Response(await work.text(),{headers:{"Content-Type":"text/html; charset=utf-8","X-Coonto-User":userId,"X-Coonto-Expires":license.expiresAt}}));
      localStorage.setItem("coonto-offline-user",userId);localStorage.setItem("coonto-alienista-offline","ready");localStorage.setItem("coonto-alienista-license-expires",license.expiresAt);
      setOfflineReady(true);setStatus(`Obra e texto original salvos até ${new Date(license.expiresAt).toLocaleDateString("pt-BR")}. Reabra Minha biblioteca neste aparelho para continuar sem internet.`);
    }catch(error){setStatus(error instanceof Error?error.message:"Não foi possível preparar o modo offline.");}finally{setPreparing(false);}
  }
  return <section className="reader-workspace">
    <aside className="reader-rail">
      <div className="reader-rail-title"><span>SUA EXPERIÊNCIA</span><strong>O Alienista</strong></div>
      <nav className="reader-rail-actions" aria-label="Ações da leitura">
        <a href="/minha-biblioteca"><Library size={18}/><span>Minha biblioteca</span></a>
        <button onClick={prepareOffline} disabled={preparing}>{preparing?<RefreshCw size={18}/>:<Download size={18}/>}<span>{preparing?"Preparando…":offlineReady?"Atualizar offline":"Salvar neste aparelho"}</span></button>
        <button onClick={()=>setHelpOpen(true)}><CircleHelp size={18}/><span>Ajuda Coonto</span></button>
        <a href="/texto/o-alienista"><BookOpen size={18}/><span>Texto de Machado</span></a>
      </nav>
      <p className="reader-rail-status" role="status">{status}</p>
    </aside>

    <div className="reader-canvas">
      <iframe ref={iframeRef} className="experience-frame" title="Experiência Coonto — O Alienista" src="/api/works/o-alienista" allow="autoplay"/>
    </div>

    {helpOpen&&<div className="reader-help-overlay" role="dialog" aria-modal="true" aria-label="Ajuda Coonto">
      <button className="reader-help-close" onClick={()=>setHelpOpen(false)} aria-label="Fechar ajuda"><X size={20}/></button>
      <div className="reader-help-panel"><CoontoHelp initialMode="student" sceneId={sceneId}/></div>
    </div>}
  </section>;
}
