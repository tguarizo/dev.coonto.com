"use client";
import { ArrowRight,KeyRound,Mail,Smartphone } from 'lucide-react';
import { FormEvent,useEffect,useState } from 'react';

export function LoginForm({returnTo,smsEnabled=false}:{returnTo:string;smsEnabled?:boolean}) {
 const [channel,setChannel]=useState<'email'|'sms'>('email');
 const [contact,setContact]=useState(''),[code,setCode]=useState(''),[name,setName]=useState('');
 const [step,setStep]=useState<'contact'|'code'|'name'>('contact');
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const [retryAt,setRetryAt]=useState(0),[now,setNow]=useState(0);
 useEffect(()=>{if(!retryAt)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[retryAt]);
 const remaining=Math.max(0,Math.ceil((retryAt-now)/1000));
 const payload=()=>({channel,...(channel==='email'?{email:contact}:{phone:contact})});
 async function requestCode(event?:FormEvent){
  event?.preventDefault();if(busy)return;
  if(Date.now()<retryAt){setStatus('Aguarde antes de pedir outro código.');return;}
  setBusy(true);setStatus('');
  try{
   const response=await fetch('/api/auth/request-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});
   const data=await response.json();if(!response.ok){setStatus(data.error||'Não foi possível enviar o código.');return;}
   setStep('code');setCode('');const sent=Date.now();setNow(sent);setRetryAt(sent+60000);
   setStatus(data.mode==='validation'?'Use o código fornecido para a validação.':channel==='email'?'Código enviado. Confira também Spam e Lixo eletrônico. Validade: 10 minutos.':'Solicitação de SMS enviada. O código vale por 10 minutos.');
  }catch{setStatus('A conexão falhou. Tente novamente.');}finally{setBusy(false);}
 }
 async function verifyCode(event:FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setStatus('');
  try{
   const response=await fetch('/api/auth/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload(),code,name,returnTo})});
   const data=await response.json();if(!response.ok){setStatus(data.error||'Não foi possível entrar.');return;}
   setRetryAt(0);setNow(0);
   if(data.needsName){setStep('name');setStatus('');return;}
   if(data.ok)window.location.assign(data.returnTo||'/minha-biblioteca');
  }catch{setStatus('A conexão falhou. Tente novamente.');}finally{setBusy(false);}
 }
 const reset=()=>{setStep('contact');setCode('');setName('');setStatus('');};
 return <div className="login-card coonto-login-card"><span className="section-kicker">SUA CONTA COONTO</span>
 {step==='contact'?<form onSubmit={requestCode}><h1>Entre no Coonto</h1><p>Receba um código. Não precisa criar senha.</p>
 <div className="login-channels" role="group" aria-label="Como receber o código"><button type="button" className={channel==='email'?'selected':''} aria-pressed={channel==='email'} disabled={busy} onClick={()=>{setChannel('email');setContact('');setStatus('');}}><Mail size={18}/>E-mail</button><button type="button" className={channel==='sms'?'selected':''} aria-pressed={channel==='sms'} disabled={busy||!smsEnabled} onClick={()=>{setChannel('sms');setContact('');setStatus('');}}><Smartphone size={18}/>{smsEnabled?'SMS':'SMS em breve'}</button></div>
 <label className="field"><span>{channel==='email'?'E-mail':'Celular com DDD'}</span><input type={channel==='email'?'email':'tel'} autoComplete={channel==='email'?'email':'tel'} required maxLength={320} value={contact} onChange={e=>setContact(e.target.value)} placeholder={channel==='email'?'voce@exemplo.com':'(11) 99999-9999'} disabled={busy}/></label>
 <button className="button button-primary" disabled={busy}>{busy?'Enviando…':<>Enviar código <ArrowRight size={18}/></>}</button><p className="guest-hint">Primeira vez? Confirme seu contato e informe seu nome para explorar como Guest.</p></form>
 :<form onSubmit={verifyCode}><KeyRound size={28}/><h1>{step==='name'?'Como podemos chamar você?':'Digite o código'}</h1>
 {step==='name'?<><label className="field"><span>Nome</span><input autoFocus autoComplete="given-name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} disabled={busy}/></label><p className="name-helper">Seu contato já foi confirmado. Com seu nome, criamos seu acesso Guest com progresso salvo e acesso à experiência gratuita.</p></>:<><p>Enviado para <strong>{contact}</strong>.</p><label className="field"><span>Código de seis números</span><input autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="000000" autoComplete="one-time-code" disabled={busy}/></label></>}
 <button className="button button-primary" disabled={busy}>{busy?'Verificando…':step==='name'?'Começar como Guest':'Entrar no Coonto'}</button>
 {step==='code'&&<button type="button" className="link-button" disabled={busy||remaining>0} onClick={()=>void requestCode()}>{remaining>0?`Reenviar em ${remaining}s`:'Reenviar código'}</button>}<button type="button" className="link-button" disabled={busy} onClick={reset}>{step==='name'?'Usar outro e-mail ou celular':'Corrigir e-mail ou celular'}</button></form>}
 {status&&<p className="form-status" role="status" aria-live="polite">{status}</p>}</div>;
}
