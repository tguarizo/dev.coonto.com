"use client";

import { useEffect, useState } from "react";

export default function ApplicationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [crm, setCrm] = useState(false);
  useEffect(() => { setCrm(window.location.hostname.startsWith("crm.")); }, []);
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#edf0f6", color: "#172033", fontFamily: "Arial, sans-serif" }}>
    <section style={{ maxWidth: 520, background: "white", padding: 32, borderRadius: 18 }} role="alert">
      <h1 style={{ marginTop: 0 }}>Não foi possível abrir esta página.</h1>
      <p>Seu acesso pode já estar ativo. Tente abrir o painel novamente.</p>
      <button onClick={reset} style={{ padding: "12px 18px", border: 0, borderRadius: 9, background: "#2454ff", color: "white", cursor: "pointer" }}>Tentar novamente</button>
      <p><a href={crm ? "/backoffice" : "/"}>{crm ? "Abrir o CRM" : "Voltar ao início"}</a></p>
    </section>
  </main>;
}
