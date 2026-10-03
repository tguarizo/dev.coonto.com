import {query} from '@/lib/db';
import {currentNetworkSchool} from '@/lib/education-network';
export const validInstitutionalGrant=`g.status='active' AND k.status='active' AND k.valid_from<=NOW() AND k.valid_until>NOW()
 AND n.status='active' AND ${currentNetworkSchool} AND ns.can_allocate_licenses
 AND m.role='student' AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW())`;
export const institutionalGrantJoins=`JOIN education_license_contracts k ON k.id=g.contract_id JOIN education_networks n ON n.id=k.network_id
 JOIN education_network_schools ns ON ns.network_id=n.id AND ns.organization_id=g.organization_id
 JOIN organizations o ON o.id=g.organization_id JOIN organization_memberships m ON m.organization_id=g.organization_id AND m.user_id=g.user_id`;
export async function availableInstitutionalWorks(userId:string){
 return query<{work_slug:string}>(`SELECT DISTINCT k.work_slug FROM education_license_grants g ${institutionalGrantJoins} WHERE g.user_id=$1 AND ${validInstitutionalGrant}`,[userId]);
}
export async function institutionalWorkAccess(userId:string,slug:string,usage:'activate'|'used'|null=null,execute:typeof query=query){
 if(!usage)return (await execute<{id:string;expires_at:Date}>(`SELECT g.id,k.valid_until AS expires_at FROM education_license_grants g ${institutionalGrantJoins} WHERE g.user_id=$1 AND k.work_slug=$2 AND ${validInstitutionalGrant} ORDER BY k.valid_until DESC LIMIT 1`,[userId,slug])).rows[0]??null;
 // Usage is recorded only when a reader downloads or opens the work, not when
 // someone views a dashboard or a license administrator allocates a seat.
 const result=await execute<{id:string;expires_at:Date}>(`WITH permitted AS (SELECT g.id,k.valid_until FROM education_license_grants g ${institutionalGrantJoins}
 WHERE g.user_id=$1 AND k.work_slug=$2 AND ${validInstitutionalGrant} ORDER BY k.valid_until DESC LIMIT 1)
 UPDATE education_license_grants g SET activated_at=COALESCE(g.activated_at,NOW()),used_at=CASE WHEN $3='used' THEN NOW() ELSE g.used_at END
 FROM permitted p WHERE g.id=p.id RETURNING g.id,p.valid_until AS expires_at`,[userId,slug,usage]);return result.rows[0]??null;
}
