import { query } from "@/lib/db";
import type { CoontoUser } from "@/lib/auth";

export type Persona = "reader"|"educator"|"school_admin"|"commercial_partner"|"cultural_partner"|"owner"|"developer";
export type OrganizationLink = { organizationId:string; organizationName:string; organizationKind:string; role:"student"|"teacher"|"manager" };

export type AccessProfile = {
  user: CoontoUser;
  personas: Persona[];
  organizations: OrganizationLink[];
  globalOperation: boolean;
  canUseEducationalCrm: boolean;
  canUseCommercialCrm: boolean;
  canUseCulturalCrm: boolean;
};

export async function getAccessProfile(user:CoontoUser):Promise<AccessProfile>{
  const [personasResult,orgResult]=await Promise.all([
    query<{persona:Persona}>("SELECT persona FROM user_personas WHERE user_id=$1 AND status='active' ORDER BY persona",[user.userId]),
    query<OrganizationLink>("SELECT m.organization_id AS \"organizationId\",o.name AS \"organizationName\",o.kind AS \"organizationKind\",m.role FROM organization_memberships m JOIN organizations o ON o.id=m.organization_id WHERE m.user_id=$1 AND o.status='active' AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW()) ORDER BY o.name",[user.userId])
  ]);
  const personas=[...new Set<Persona>([
    ...personasResult.rows.map(r=>r.persona),
    ...(user.role==="admin"?["owner" as const]:[]),
    ...orgResult.rows.map(r=>r.role==="manager"?"school_admin" as const:r.role==="teacher"?"educator" as const:"reader" as const)
  ])];
  return {
    user,personas,organizations:orgResult.rows,
    globalOperation:personas.includes("owner"),
    canUseEducationalCrm:personas.includes("owner")||personas.includes("educator")||personas.includes("school_admin"),
    canUseCommercialCrm:personas.includes("owner")||personas.includes("commercial_partner"),
    canUseCulturalCrm:personas.includes("owner")||personas.includes("cultural_partner"),
  };
}

export function hasPersona(profile:AccessProfile,persona:Persona){return profile.personas.includes(persona);}

export function educationOrganizationIds(profile:AccessProfile){
  if(profile.globalOperation)return profile.organizations.map(o=>o.organizationId);
  return profile.organizations.filter(o=>o.role==="teacher"||o.role==="manager").map(o=>o.organizationId);
}

export async function commercialScope(userId:string){
  const rows=await query<{organization_id:string|null;lead_id:string|null}>("SELECT organization_id,lead_id FROM commercial_partner_assignments WHERE partner_user_id=$1",[userId]);
  return {organizationIds:rows.rows.map(r=>r.organization_id).filter(Boolean) as string[],leadIds:rows.rows.map(r=>r.lead_id).filter(Boolean) as string[]};
}

export async function culturalScope(userId:string){
  const rows=await query<{work_slug:string;can_comment:boolean;can_approve:boolean;can_publish:boolean}>("SELECT work_slug,can_comment,can_approve,can_publish FROM curator_work_permissions WHERE user_id=$1",[userId]);
  return rows.rows;
}
