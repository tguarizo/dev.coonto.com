"use client";

import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email"|"code">("email");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const requestCode = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/auth/request-code", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
      const data = await response.json() as { error?: string; mode?: string };
      if (!response.ok) return setStatus(data.error || "Não foi possível enviar o código.");
      setStep("code"); setStatus(data.mode === "validation" ? "Use o código de acesso fornecido para esta validação." : "Enviamos um código de seis números para seu e-mail.");
    } catch { setStatus("A conexão falhou. Recarregue a página e tente novamente."); }
    finally { setBusy(false); }
  };
  const verifyCode = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/auth/verify-code", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,code,returnTo}) });
      const data = await response.json() as { error?: string; returnTo?: string };
      if (!response.ok) return setStatus(data.error || "Não foi possível entrar.");
      setStatus("Acesso confirmado. Abrindo o Coonto…");
      window.location.assign(data.returnTo || returnTo);
    } catch { setStatus("Não foi possível abrir a página. Acesse o CRM novamente pelo endereço do navegador."); }
    finally { setBusy(false); }
  };
  return <div className="login-card">{step === "email" ? <form onSubmit={requestCode}><Mail size={28}/><h2>Entre com seu e-mail</h2><p>Você receberá um código temporário. Não precisa criar senha.</p><label className="field"><span>E-mail</span><input type="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="voce@exemplo.com" autoComplete="email"/></label><button className="button button-primary" disabled={busy}>{busy ? "Enviando…" : <>Receber código <ArrowRight size={18}/></>}</button></form> : <form onSubmit={verifyCode}><KeyRound size={28}/><h2>Digite o código</h2><p>Enviado para <strong>{email}</strong>.</p><label className="field"><span>Código de seis números</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,""))} placeholder="000000" autoComplete="one-time-code"/></label><button className="button button-primary" disabled={busy}>{busy ? "Verificando…" : "Entrar no Coonto"}</button><button type="button" className="link-button" onClick={()=>{setStep("email");setStatus("");}}>Usar outro e-mail</button></form>}{status && <p className="form-status">{status}</p>}</div>;
}
