import {randomUUID} from 'node:crypto';
import {query} from '@/lib/db';
import {transaction} from '@/lib/transaction';
import {currentNetworkMember,currentNetworkSchool} from '@/lib/education-network';
import {freeWork} from '@/lib/free-works';
const licenseScope=`EXISTS(SELECT 1 FROM education_networks n JOIN education_network_memberships nm ON nm.network_id=n.id
 WHERE n.id=k.network_id AND nm.user_id=$1 AND nm.can_manage_licenses AND ${currentNetworkMember})`;
export {availableInstitutionalWorks,institutionalWorkAccess} from '@/lib/institutional-license-access';
export type LicenseContract={id:string;reference:string;work_slug:string;seats:number;status:string;valid_from:Date;valid_until:Date;allocated:string;assigned:string;activated:string;used:string};
export async function networkContracts(userId:string,networkId:string){
 return query<LicenseContract>(`SELECT k.*,
 (SELECT COALESCE(SUM(a.seats),0)::text FROM education_license_allocations a WHERE a.contract_id=k.id) AS allocated,
 (SELECT COUNT(*)::text FROM education_license_grants g WHERE g.contract_id=k.id AND g.status='active') AS assigned,
 (SELECT COUNT(*)::text FROM education_license_grants g WHERE g.contract_id=k.id AND g.status='active' AND g.activated_at IS NOT NULL) AS activated,
 (SELECT COUNT(*)::text FROM education_license_grants g WHERE g.contract_id=k.id AND g.status='active' AND g.used_at IS NOT NULL) AS used
 FROM education_license_contracts k WHERE k.network_id=$2 AND ${licenseScope} ORDER BY k.created_at DESC,k.id`,[userId,networkId]);
}
async function audit(client:{query:typeof query},actor:string,school:string|null,type:string,id:string,metadata:Record<string,unknown>){
 await client.query(`INSERT INTO crm_events(id,event_type,user_id,organization_id,related_type,related_id,metadata) VALUES($1,$2,$3,$4,'education_license',$5,$6::jsonb)`,[randomUUID(),type,actor,school,id,JSON.stringify(metadata)]);
}
export async function createNetworkContract(actorId:string,networkId:string,reference:string,slug:string,seats:number,from:Date,until:Date){
 if(!freeWork(slug)||reference.length<2||reference.length>160||!Number.isInteger(seats)||seats<1||seats>1000000||!Number.isFinite(from.getTime())||!Number.isFinite(until.getTime())||until<=from)return false;
 return transaction(async client=>{
  const inserted=await client.query(`INSERT INTO education_license_contracts(id,network_id,reference,work_slug,seats,valid_from,valid_until)
 SELECT $3,n.id,$4,$5,$6,$7,$8 FROM education_networks n JOIN users u ON u.id=$1
 WHERE n.id=$2 AND n.status='active' AND u.role='admin' RETURNING id`,[actorId,networkId,randomUUID(),reference,slug,seats,from,until]);
  if(!inserted.rows[0])return false;
  await audit(client as unknown as {query:typeof query},actorId,null,'education_contract_created',inserted.rows[0].id,{networkId,slug,seats});return true;
 });
}
export async function allocateSchoolSeats(actorId:string,networkId:string,contractId:string,organizationId:string,seats:number){
 if(!Number.isInteger(seats)||seats<0||seats>1000000)return false;
 return transaction(async client=>{
  const contract=await client.query<{seats:number}>(`SELECT k.seats FROM education_license_contracts k WHERE k.id=$3 AND k.network_id=$2
 AND k.status='active' AND k.valid_from<=NOW() AND k.valid_until>NOW() AND ${licenseScope}
 AND EXISTS(SELECT 1 FROM education_network_schools ns JOIN organizations o ON o.id=ns.organization_id
 WHERE ns.network_id=k.network_id AND ns.organization_id=$4 AND ns.can_allocate_licenses AND ${currentNetworkSchool}) FOR UPDATE`,[actorId,networkId,contractId,organizationId]);
  if(!contract.rows[0])return false;
  const used=await client.query<{total:string}>(`SELECT COUNT(*)::text AS total FROM education_license_grants WHERE contract_id=$1 AND organization_id=$2 AND status='active'`,[contractId,organizationId]);
  const total=await client.query<{total:string}>(`SELECT COALESCE(SUM(seats),0)::text AS total FROM education_license_allocations WHERE contract_id=$1 AND organization_id<>$2`,[contractId,organizationId]);
  if(seats<Number(used.rows[0].total)||seats+Number(total.rows[0].total)>contract.rows[0].seats)return false;
  await client.query(`INSERT INTO education_license_allocations(contract_id,organization_id,seats) VALUES($1,$2,$3)
 ON CONFLICT(contract_id,organization_id) DO UPDATE SET seats=EXCLUDED.seats,updated_at=NOW()`,[contractId,organizationId,seats]);
  await audit(client as unknown as {query:typeof query},actorId,organizationId,'education_seats_allocated',contractId,{seats});return true;
 });
}
const schoolLicenseScope=`(${licenseScope} OR EXISTS(SELECT 1 FROM organization_memberships sm WHERE sm.organization_id=a.organization_id AND sm.user_id=$1 AND sm.role='manager' AND sm.status='active' AND sm.valid_from<=NOW() AND (sm.valid_until IS NULL OR sm.valid_until>NOW())))`;
export async function schoolAllocations(actorId:string,organizationId:string){
 return query<{contract_id:string;reference:string;work_slug:string;seats:number;assigned:string;valid_until:Date}>(`SELECT a.contract_id,k.reference,k.work_slug,a.seats,k.valid_until,
 (SELECT COUNT(*)::text FROM education_license_grants g WHERE g.contract_id=k.id AND g.organization_id=a.organization_id AND g.status='active') AS assigned
 FROM education_license_allocations a JOIN education_license_contracts k ON k.id=a.contract_id
 JOIN education_networks n ON n.id=k.network_id JOIN education_network_schools ns ON ns.network_id=n.id AND ns.organization_id=a.organization_id JOIN organizations o ON o.id=a.organization_id
 WHERE a.organization_id=$2 AND ${schoolLicenseScope} AND k.status='active' AND k.valid_from<=NOW() AND k.valid_until>NOW()
 AND n.status='active' AND ${currentNetworkSchool} AND ns.can_allocate_licenses ORDER BY k.reference,k.id`,[actorId,organizationId]);
}
export async function schoolLicenseStudents(actorId:string,organizationId:string){
 // No pedagogical data is exposed to a licensing-only administrator.
 return query<{id:string;name:string}>(`SELECT u.id,u.name FROM organization_memberships m JOIN users u ON u.id=m.user_id
 WHERE m.organization_id=$2 AND m.role='student' AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW())
 AND EXISTS(SELECT 1 FROM education_license_allocations a JOIN education_license_contracts k ON k.id=a.contract_id
 JOIN education_networks n ON n.id=k.network_id JOIN education_network_schools ns ON ns.network_id=n.id AND ns.organization_id=a.organization_id JOIN organizations o ON o.id=a.organization_id
 WHERE a.organization_id=m.organization_id AND ${schoolLicenseScope} AND n.status='active' AND k.status='active' AND k.valid_from<=NOW() AND k.valid_until>NOW() AND ns.can_allocate_licenses AND ${currentNetworkSchool}) ORDER BY u.name,u.id`,[actorId,organizationId]);
}
export async function schoolLicenseGrants(actorId:string,organizationId:string){
 return query<{id:string;name:string;contract_id:string;work_slug:string;status:string}>(`SELECT g.id,u.name,g.contract_id,k.work_slug,g.status FROM education_license_grants g
 JOIN users u ON u.id=g.user_id JOIN education_license_allocations a ON a.contract_id=g.contract_id AND a.organization_id=g.organization_id
 JOIN education_license_contracts k ON k.id=g.contract_id JOIN education_networks n ON n.id=k.network_id
 JOIN education_network_schools ns ON ns.network_id=n.id AND ns.organization_id=g.organization_id JOIN organizations o ON o.id=g.organization_id
 WHERE g.organization_id=$2 AND ${schoolLicenseScope} AND n.status='active' AND ns.can_allocate_licenses AND ${currentNetworkSchool} ORDER BY u.name,g.id`,[actorId,organizationId]);
}
export async function assignInstitutionalLicense(actorId:string,organizationId:string,contractId:string,userId:string){
 return transaction(async client=>{
  // One contract lock serializes all seat changes and grants under that contract.
  const allowed=await client.query(`SELECT k.id FROM education_license_contracts k JOIN education_license_allocations a ON a.contract_id=k.id
 JOIN education_networks n ON n.id=k.network_id JOIN education_network_schools ns ON ns.network_id=n.id AND ns.organization_id=a.organization_id JOIN organizations o ON o.id=a.organization_id
 WHERE k.id=$3 AND a.organization_id=$2 AND ${schoolLicenseScope} AND k.status='active' AND k.valid_from<=NOW() AND k.valid_until>NOW()
 AND n.status='active' AND ns.can_allocate_licenses AND ${currentNetworkSchool} FOR UPDATE OF k`,[actorId,organizationId,contractId]);
  if(!allowed.rows.length)return false;
  const member=await client.query(`SELECT 1 FROM organization_memberships WHERE organization_id=$1 AND user_id=$2 AND role='student' AND status='active' AND valid_from<=NOW() AND (valid_until IS NULL OR valid_until>NOW())`,[organizationId,userId]);if(!member.rows.length)return false;
  const existing=await client.query<{organization_id:string;status:string}>(`SELECT organization_id,status FROM education_license_grants WHERE contract_id=$1 AND user_id=$2`,[contractId,userId]);
  if(existing.rows[0]?.organization_id!==undefined&&existing.rows[0].organization_id!==organizationId)return false;
  if(existing.rows[0]?.status==='active')return true;
  const capacity=await client.query<{seats:number;used:string}>(`SELECT a.seats,(SELECT COUNT(*)::text FROM education_license_grants g WHERE g.contract_id=a.contract_id AND g.organization_id=a.organization_id AND g.status='active') AS used FROM education_license_allocations a WHERE contract_id=$1 AND organization_id=$2`,[contractId,organizationId]);
  if(Number(capacity.rows[0].used)>=capacity.rows[0].seats)return false;
  const result=await client.query(`INSERT INTO education_license_grants(id,contract_id,organization_id,user_id) VALUES($1,$2,$3,$4)
 ON CONFLICT(contract_id,user_id) DO UPDATE SET status='active',updated_at=NOW(),activated_at=NULL,used_at=NULL RETURNING id`,[randomUUID(),contractId,organizationId,userId]);
  await audit(client as unknown as {query:typeof query},actorId,organizationId,'education_license_assigned',result.rows[0].id,{contractId,userId});return true;
 });
}
export async function revokeInstitutionalLicense(actorId:string,organizationId:string,grantId:string){
 return transaction(async client=>{
  const result=await client.query(`UPDATE education_license_grants g SET status='revoked',updated_at=NOW() FROM education_license_allocations a,education_license_contracts k,education_networks n,education_network_schools ns,organizations o
 WHERE g.id=$3 AND g.organization_id=$2 AND a.contract_id=g.contract_id AND a.organization_id=g.organization_id AND k.id=a.contract_id
 AND n.id=k.network_id AND ns.network_id=n.id AND ns.organization_id=a.organization_id AND o.id=a.organization_id
 AND ${schoolLicenseScope} AND n.status='active' AND ns.can_allocate_licenses AND ${currentNetworkSchool} AND g.status='active' RETURNING g.id`,[actorId,organizationId,grantId]);
  if(!result.rows.length)return false;
  await audit(client as unknown as {query:typeof query},actorId,organizationId,'education_license_revoked',grantId,{});return true;
 });
}
export async function schoolLicenseContext(actorId:string,organizationId:string){
 return (await query<{id:string;name:string}>(`SELECT o.id,o.name FROM organizations o WHERE o.id=$2 AND o.status='active'
 AND (EXISTS(SELECT 1 FROM organization_memberships m WHERE m.organization_id=o.id AND m.user_id=$1 AND m.role='manager'
 AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW()))
 OR EXISTS(SELECT 1 FROM education_network_schools ns JOIN education_networks n ON n.id=ns.network_id
 JOIN education_network_memberships nm ON nm.network_id=n.id WHERE ns.organization_id=o.id AND nm.user_id=$1
 AND nm.can_manage_licenses AND ns.can_allocate_licenses AND ${currentNetworkMember} AND ${currentNetworkSchool}))`,[actorId,organizationId])).rows[0]??null;
}
