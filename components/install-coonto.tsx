"use client";
import {useEffect,useState} from "react";
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export function InstallCoonto(){
 const[event,setEvent]=useState<InstallEvent|null>(null);const[installed,setInstalled]=useState(false);
 useEffect(()=>{setInstalled(window.matchMedia('(display-mode: standalone)').matches);const receive=(e:Event)=>{e.preventDefault();setEvent(e as InstallEvent);};const done=()=>{setInstalled(true);setEvent(null);};window.addEventListener('beforeinstallprompt',receive);window.addEventListener('appinstalled',done);return()=>{window.removeEventListener('beforeinstallprompt',receive);window.removeEventListener('appinstalled',done);};},[]);
 return <section className="coonto-install">
   <h2>Leve o Coonto com você</h2>
   <p>Use pelo navegador no computador, tablet ou celular. Você também pode adicionar o Coonto à tela inicial.</p>
   <p>Para continuar sem internet, autorize a obra neste aparelho. Seu progresso e o direito de acesso continuam vinculados à sua conta Coonto.</p>
   {!event&&!installed&&<><p>Android ou computador: use o menu do Chrome ou Edge e escolha instalar o aplicativo.</p><p>iPhone ou iPad: no Safari, use Compartilhar → Adicionar à Tela de Início.</p></>}
   <div className="coonto-install-action">
     {installed?<span>Coonto já instalado neste aparelho.</span>:event?<button className="button button-primary" onClick={async()=>{await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted')setEvent(null);}}>Instalar Coonto</button>:<span>Você pode instalar quando quiser pelo menu do navegador.</span>}
   </div>
 </section>;
}
