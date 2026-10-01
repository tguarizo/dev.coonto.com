"use server";
import {revalidatePath} from "next/cache";
import {requireUser} from "@/lib/auth";
import {getAccessProfile,culturalScope} from "@/lib/access-control";
import {query} from "@/lib/db";

export async function addCuratorComment(form:FormData){
 const user=await requireUser("/curadoria");const access=await getAccessProfile(user);
 if(!access.canUseCulturalCrm)throw new Error("Acesso negado");
 const work=String(form.get("work_slug")||"").trim(),scene=String(form.get("scene_id")||"").trim(),body=String(form.get("body")||"").trim().slice(0,4000);
 if(!work||!scene||!body)throw new Error("Comentário incompleto");
 if(!access.globalOperation){const allowed=await culturalScope(user.userId);if(!allowed.some(p=>p.work_slug===work&&p.can_comment))throw new Error("Sem permissão para comentar esta obra");}
 await query("INSERT INTO curator_scene_comments(id,user_id,work_slug,scene_id,body) VALUES($1,$2,$3,$4,$5)",[crypto.randomUUID(),user.userId,work,scene,body]);
 revalidatePath("/curadoria");
}
