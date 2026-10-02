"use client";
import {useRef,useState} from "react";
import videos from "@/content/coonto-videos.json";

export function CoontoVideos(){
  const players=useRef<Record<string,HTMLVideoElement|null>>({});
  const[failed,setFailed]=useState<Record<string,boolean>>({});
  return <section className="coonto-videos" id="coonto-em-uso" aria-labelledby="coonto-videos-title">
    <span className="section-kicker">VEJA O COONTO EM USO</span>
    <h2 id="coonto-videos-title">Na escola e depois da aula.</h2>
    <p>Dois vídeos em teste nesta versão. Assista quando quiser e continue sua experiência.</p>
    <div className="coonto-video-grid">{videos.map(video=><article key={video.id}>
      <h3>{video.title}</h3><p>{video.description}</p>
      <video ref={el=>{players.current[video.id]=el;}} controls playsInline preload="none" aria-label={video.title}
        onPlay={()=>Object.entries(players.current).forEach(([id,player])=>{if(id!==video.id)player?.pause();})}
        onError={()=>setFailed(current=>({...current,[video.id]:true}))}>
        <source src={video.src} type="video/mp4"/>
        Seu navegador não reproduz este vídeo. <a href={video.src}>Abrir vídeo</a>.
      </video>
      {failed[video.id]&&<p role="alert">Não foi possível carregar. <a href={video.src}>Abrir o vídeo diretamente</a>.</p>}
    </article>)}</div>
    <p><a href="/pesquisa">Conte na pesquisa se os vídeos ajudaram a entender o Coonto →</a></p>
  </section>;
}
