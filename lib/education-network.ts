import { query } from '@/lib/db';
export type NetworkContext={id:string;name:string;can_manage_licenses:boolean;can_view_reports:boolean;can_drilldown:boolean};
export const currentNetworkMember=`n.status='active' AND nm.status='active' AND nm.valid_from<=NOW() AND (nm.valid_until IS NULL OR nm.valid_until>NOW())`;
export const currentNetworkSchool=`ns.status='active' AND ns.valid_from<=NOW() AND (ns.valid_until IS NULL OR ns.valid_until>NOW()) AND o.status='active'`;
export async function networkContexts(userId:string){
 return (await query<NetworkContext>(`SELECT n.id,n.name,nm.can_manage_licenses,nm.can_view_reports,nm.can_drilldown FROM education_networks n
 JOIN education_network_memberships nm ON nm.network_id=n.id WHERE nm.user_id=$1 AND ${currentNetworkMember}
 AND (nm.can_manage_licenses OR nm.can_view_reports) ORDER BY n.name,n.id`,[userId])).rows;
}
export async function networkSchools(userId:string,networkId:string){
 return query<{id:string;name:string;can_allocate_licenses:boolean;can_share_reports:boolean}>(`SELECT o.id,o.name,
 (nm.can_manage_licenses AND ns.can_allocate_licenses) AS can_allocate_licenses,
 (nm.can_view_reports AND ns.can_share_reports) AS can_share_reports
 FROM education_network_schools ns JOIN organizations o ON o.id=ns.organization_id
 JOIN education_networks n ON n.id=ns.network_id JOIN education_network_memberships nm ON nm.network_id=n.id
 WHERE nm.user_id=$1 AND n.id=$2 AND ${currentNetworkMember} AND ${currentNetworkSchool}
 AND ((nm.can_manage_licenses AND ns.can_allocate_licenses) OR (nm.can_view_reports AND ns.can_share_reports)) ORDER BY o.name,o.id`,[userId,networkId]);
}
