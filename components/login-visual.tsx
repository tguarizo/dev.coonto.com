'use client';
import {useState} from 'react';
export function LoginVisual({image}:{image:string}) {
 const [failed,setFailed]=useState(false);
 return <aside className="login-visual"><img src={failed?'/images/coonto-logo.png':`/api/login-art/${image}`} onError={()=>{if(!failed)setFailed(true);}} alt="Ilustração da experiência O Alienista"/><div className="login-visual-copy"><span className="section-kicker">O ALIENISTA · MACHADO DE ASSIS</span><h2>Entre na obra.<br/>Saia compreendendo.</h2><p>Decidir. Descobrir. Entender. Lembrar.</p></div></aside>;
}
