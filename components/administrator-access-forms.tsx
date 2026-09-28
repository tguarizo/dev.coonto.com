"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { grantAdministrator, revokeAdministrator, type AccessResult } from "@/app/backoffice/administradores/actions";

const initial: AccessResult = { ok: false, message: "" };

export function GrantAdministratorForm() {
  const [state, action, pending] = useActionState(grantAdministrator, initial);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => { if (state.ok) { form.current?.reset(); router.refresh(); } }, [state, router]);
  return <><form ref={form} action={action} className="crm-inline-form"><label className="field">E-mail da pessoa<input name="email" type="email" autoComplete="email" maxLength={320} required placeholder="pessoa@exemplo.com"/></label><button className="button button-primary" disabled={pending}>{pending ? "Salvando…" : "Conceder acesso"}</button></form>{state.message && <p role={state.ok ? "status" : "alert"}>{state.message}</p>}</>;
}

export function RevokeAdministratorForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(revokeAdministrator, initial);
  const router = useRouter();
  useEffect(() => { if (state.ok) router.refresh(); }, [state, router]);
  return <form action={action}><input type="hidden" name="id" value={id}/><button className="button button-outline" disabled={pending}>{pending ? "Retirando…" : "Retirar acesso"}</button>{state.message && <p role={state.ok ? "status" : "alert"}>{state.message}</p>}</form>;
}
