"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCrmHost } from "@/lib/admin-host";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function updateEntryStatus(form: FormData) {
  await requireCrmHost();
  const user = await requireUser("/backoffice/entradas");
  if (user.role !== "admin") throw new Error("Acesso negado");
  const id = String(form.get("id") || "");
  const kind = String(form.get("kind") || "");
  const status = String(form.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["feedback", "suggestions"].includes(kind) || !["new", "reviewed", "archived"].includes(status)) throw new Error("Dados inválidos");
  const table = kind === "feedback" ? "feedback" : "work_suggestions";
  await query(`UPDATE ${table} SET status=$1 WHERE id=$2`, [status, id]);
  revalidatePath("/backoffice/entradas");
  redirect("/backoffice/entradas?salvo=1");
}
