import { query } from '@/lib/db';

export type EducationContext = { id:string; name:string; role:'manager'|'teacher' };
// An institutional role is granted by a current membership, never by a global
// persona or by an organization identifier supplied by the browser.
export async function educationContexts(userId:string):Promise<EducationContext[]> {
  const result=await query<EducationContext>(`SELECT o.id,o.name,m.role FROM organization_memberships m
    JOIN organizations o ON o.id=m.organization_id
    WHERE m.user_id=$1 AND m.role IN ('manager','teacher') AND o.status='active'
      AND m.status='active' AND m.valid_from<=NOW()
      AND (m.valid_until IS NULL OR m.valid_until>NOW()) ORDER BY o.name,o.id`,[userId]);
  return result.rows;
}
export function selectEducationContext(contexts:EducationContext[], requested?:string) {
  if(requested!==undefined)return contexts.find(context=>context.id===requested)??null;
  return contexts.length===1?contexts[0]:null;
}
export async function contextClassrooms(userId:string,context:EducationContext) {
  return query<{id:string;name:string;students:string;teachers:string}>(`SELECT c.id,c.name,
    (SELECT COUNT(*)::text FROM classroom_enrollments e WHERE e.organization_id=c.organization_id AND e.classroom_id=c.id) AS students,
    (SELECT COUNT(*)::text FROM classroom_teachers t WHERE t.organization_id=c.organization_id AND t.classroom_id=c.id) AS teachers
    FROM classrooms c JOIN organization_memberships m ON m.organization_id=c.organization_id AND m.user_id=$1
    JOIN organizations o ON o.id=c.organization_id
    WHERE c.organization_id=$2 AND o.status='active' AND m.status='active' AND m.valid_from<=NOW()
      AND (m.valid_until IS NULL OR m.valid_until>NOW())
      AND (m.role='manager' OR (m.role='teacher' AND EXISTS (
        SELECT 1 FROM classroom_teachers ct WHERE ct.organization_id=c.organization_id AND ct.classroom_id=c.id AND ct.user_id=$1)))
    ORDER BY c.name,c.id`,[userId,context.id]);
}
