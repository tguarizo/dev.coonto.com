"use server";
import {revalidatePath} from "next/cache";
import {requireUser} from "@/lib/auth";
import {getAccessProfile} from "@/lib/access-control";
import {query} from "@/lib/db";

const personas=["reader","educator","school_admin","commercial_partner","cultural_partner","owner","developer"] as const;
async function owner(){
 const user=await requireUser("/backoffice/personas");const access=await getAccessProfile(user);
 if(!access.globalOperation)throw new Error("Apenas owners podem alterar personas");
 return user;
}
export async function setPersona(form:FormData){
 const actor=await owner();const userId=String(form.get("user_id")||""),persona=String(form.get("persona")||"") as typeof personas[number],enabled=String(form.get("enabled")||"")==="1";
 if(!userId||!personas.includes(persona))throw new Error("Persona inválida");
 if(persona==="owner"&&!enabled){
  const owners=await query<{count:string}>("SELECT COUNT(*)::text AS count FROM user_personas WHERE persona='owner' AND status='active'");
  const target=await query("SELECT 1 FROM user_personas WHERE user_id=$1 AND persona='owner' AND status='active'",[userId]);
  if(target.rowCount&&Number(owners.rows[0]?.count||0)<=1)throw new Error("Não é possível revogar o último owner");
 }
 await query("INSERT INTO user_personas(user_id,persona,status,verified_at,metadata) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT(user_id,persona) DO UPDATE SET status=EXCLUDED.status,verified_at=EXCLUDED.verified_at,metadata=EXCLUDED.metadata",[userId,persona,enabled?"active":"revoked",enabled?new Date().toISOString():null,JSON.stringify({changedBy:actor.userId})]);
 if(persona==="owner")await query("UPDATE users SET role=$1 WHERE id=$2",[enabled?"admin":"member",userId]);
 revalidatePath("/backoffice/personas");
}
export async function setCuratorWork(form:FormData){
 await owner();const userId=String(form.get("user_id")||""),work=String(form.get("work_slug")||"").trim();
 if(!userId||!work)throw new Error("Dados inválidos");
 const comment=form.get("can_comment")==="on",approve=form.get("can_approve")==="on",publish=form.get("can_publish")==="on";
 await query("INSERT INTO curator_work_permissions(user_id,work_slug,can_comment,can_approve,can_publish) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,work_slug) DO UPDATE SET can_comment=EXCLUDED.can_comment,can_approve=EXCLUDED.can_approve,can_publish=EXCLUDED.can_publish",[userId,work,comment,approve,publish]);
 revalidatePath("/backoffice/personas");
}

export async function setCommercialScope(form:FormData){
 await owner();const userId=String(form.get("user_id")||""),kind=String(form.get("kind")||""),target=String(form.get("target_id")||""),enabled=String(form.get("enabled")||"")==="1";
 if(!userId||!target||!["lead","organization"].includes(kind))throw new Error("Escopo inválido");
 const column=kind==="lead"?"lead_id":"organization_id";
 if(enabled)await query(`INSERT INTO commercial_partner_assignments(partner_user_id,${column}) VALUES($1,$2) ON CONFLICT DO NOTHING`,[userId,target]);
 else await query(`DELETE FROM commercial_partner_assignments WHERE partner_user_id=$1 AND ${column}=$2`,[userId,target]);
 revalidatePath("/backoffice/personas");
}
