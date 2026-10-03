import { randomUUID } from 'node:crypto';
import { query } from '@/lib/db';
// Recheck membership in every query, including mutations. The active context
// is navigation only; it cannot turn an owner or a revoked teacher into staff.
const staffScope=`JOIN organization_memberships m ON m.organization_id=c.organization_id AND m.user_id=$1
 JOIN organizations o ON o.id=c.organization_id
 WHERE c.organization_id=$2 AND o.status='active' AND m.status='active' AND m.valid_from<=NOW()
 AND (m.valid_until IS NULL OR m.valid_until>NOW())
 AND (m.role='manager' OR (m.role='teacher' AND EXISTS(SELECT 1 FROM classroom_teachers ct
 WHERE ct.organization_id=c.organization_id AND ct.classroom_id=c.id AND ct.user_id=$1)))`;
const studentScope=`JOIN classroom_enrollments e ON e.organization_id=a.organization_id AND e.classroom_id=a.classroom_id AND e.user_id=$1
 JOIN organization_memberships m ON m.organization_id=e.organization_id AND m.user_id=e.user_id
 JOIN organizations o ON o.id=e.organization_id
 WHERE m.role='student' AND m.status='active' AND m.valid_from<=NOW()
 AND (m.valid_until IS NULL OR m.valid_until>NOW()) AND o.status='active'`;
export async function createActivity(userId:string,organizationId:string,classroomId:string,title:string,instructions:string){
 if(title.length<2||title.length>160||instructions.length<2||instructions.length>8000)return false;
 const result=await query(`INSERT INTO educational_activities(id,organization_id,classroom_id,created_by,title,instructions)
 SELECT $4,c.organization_id,c.id,$1,$5,$6 FROM classrooms c ${staffScope} AND c.id=$3 RETURNING id`,[userId,organizationId,classroomId,randomUUID(),title,instructions]);
 return result.rows.length===1;
}
export type Activity={id:string;classroom_id:string;title:string;instructions:string;status:string;submitted:string;reviewed:string};
export async function staffActivities(userId:string,organizationId:string,classroomId?:string){
 return query<Activity>(`SELECT a.id,a.classroom_id,a.title,a.instructions,a.status,
 (SELECT COUNT(*)::text FROM educational_submissions s WHERE s.organization_id=a.organization_id AND s.activity_id=a.id) AS submitted,
 (SELECT COUNT(*)::text FROM educational_submissions s WHERE s.organization_id=a.organization_id AND s.activity_id=a.id AND s.feedback_at IS NOT NULL) AS reviewed
 FROM educational_activities a JOIN classrooms c ON c.id=a.classroom_id AND c.organization_id=a.organization_id
 ${staffScope} AND ($3::text IS NULL OR c.id=$3) ORDER BY a.created_at DESC,a.id`,[userId,organizationId,classroomId??null]);
}
export async function staffSubmissions(userId:string,organizationId:string,activityId:string){
 return query<{student_id:string;name:string;body:string;feedback:string|null}>(`SELECT s.student_id,u.name,s.body,s.feedback FROM educational_submissions s
 JOIN educational_activities a ON a.id=s.activity_id AND a.organization_id=s.organization_id
 JOIN classrooms c ON c.id=a.classroom_id AND c.organization_id=a.organization_id JOIN users u ON u.id=s.student_id
 ${staffScope} AND a.id=$3 ORDER BY u.name,s.student_id`,[userId,organizationId,activityId]);
}
export async function giveFeedback(userId:string,organizationId:string,activityId:string,studentId:string,feedback:string){
 if(feedback.length<1||feedback.length>8000)return false;
 const result=await query(`WITH permitted AS (SELECT a.id FROM educational_activities a JOIN classrooms c ON c.id=a.classroom_id AND c.organization_id=a.organization_id
 ${staffScope} AND a.id=$3)
 UPDATE educational_submissions s SET feedback=$5,feedback_by=$1,feedback_at=NOW()
 WHERE s.organization_id=$2 AND s.activity_id IN(SELECT id FROM permitted) AND s.student_id=$4 RETURNING student_id`,[userId,organizationId,activityId,studentId,feedback]);
 return result.rows.length===1;
}
export async function studentActivities(userId:string){
 return query<{id:string;organization_name:string;classroom_name:string;title:string;instructions:string;status:string;body:string|null;feedback:string|null}>(`SELECT a.id,o.name AS organization_name,c.name AS classroom_name,a.title,a.instructions,a.status,s.body,s.feedback
 FROM educational_activities a JOIN classrooms c ON c.id=a.classroom_id AND c.organization_id=a.organization_id
 LEFT JOIN educational_submissions s ON s.activity_id=a.id AND s.organization_id=a.organization_id AND s.student_id=$1
 ${studentScope} ORDER BY a.created_at DESC,a.id`,[userId]);
}
export async function submitActivity(userId:string,activityId:string,body:string){
 if(body.length<1||body.length>12000)return false;
 const result=await query(`INSERT INTO educational_submissions(organization_id,activity_id,student_id,body)
 SELECT a.organization_id,a.id,$1,$3 FROM educational_activities a ${studentScope} AND a.id=$2 AND a.status='open'
 ON CONFLICT(activity_id,student_id) DO UPDATE SET body=EXCLUDED.body,submitted_at=NOW(),feedback=NULL,feedback_by=NULL,feedback_at=NULL RETURNING activity_id`,[userId,activityId,body]);
 return result.rows.length===1;
}
