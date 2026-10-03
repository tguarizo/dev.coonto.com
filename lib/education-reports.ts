import {query} from '@/lib/db';
import {currentNetworkMember,currentNetworkSchool} from '@/lib/education-network';
export type ReportWindow={from:string;until:string;start:Date;end:Date};
function calendarDate(value:string){const date=new Date(value+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;}
export function reportWindow(from?:string,until?:string):ReportWindow|null{
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const first=from??today.slice(0,7)+'-01',last=until??today;
 if(!calendarDate(first)||!calendarDate(last))return null;
 const start=new Date(first+'T00:00:00-03:00'),end=new Date(new Date(last+'T00:00:00-03:00').getTime()+86400000);
 if(end<=start||end.getTime()-start.getTime()>366*86400000)return null;
 return {from:first,until:last,start,end};
}
export type EducationReport={activities:string;eligible_participations:string;eligible_people:string;submitted:string;submitted_people:string;reviewed:string};
const reportSchools=`SELECT o.id FROM education_network_schools ns JOIN organizations o ON o.id=ns.organization_id
 JOIN education_networks n ON n.id=ns.network_id JOIN education_network_memberships nm ON nm.network_id=n.id
 WHERE nm.user_id=$1 AND n.id=$2 AND nm.can_view_reports AND ns.can_share_reports AND ${currentNetworkMember} AND ${currentNetworkSchool}
 AND ($5::text IS NULL OR (o.id=$5 AND nm.can_drilldown))`;
export async function networkReport(userId:string,networkId:string,window:ReportWindow,schoolId?:string,teacherId?:string,classroomId?:string){
 const result=await query<EducationReport>(`WITH schools AS (${reportSchools}),activities AS (
 SELECT a.id,a.organization_id,a.classroom_id FROM educational_activities a
 WHERE a.organization_id IN(SELECT id FROM schools) AND a.created_at>=$3 AND a.created_at<$4
 AND (($6::text IS NULL AND $7::text IS NULL) OR $5::text IS NOT NULL)
 AND ($7::text IS NULL OR a.classroom_id=$7)
 AND ($6::text IS NULL OR EXISTS(SELECT 1 FROM classroom_teachers ct JOIN organization_memberships tm ON tm.organization_id=ct.organization_id AND tm.user_id=ct.user_id
 WHERE ct.classroom_id=a.classroom_id AND ct.organization_id=a.organization_id AND ct.user_id=$6 AND tm.role='teacher'
 AND tm.status='active' AND tm.valid_from<=NOW() AND (tm.valid_until IS NULL OR tm.valid_until>NOW())))
 ),eligible AS (
 SELECT DISTINCT a.id AS activity_id,e.user_id,a.organization_id FROM activities a JOIN classroom_enrollments e ON e.classroom_id=a.classroom_id AND e.organization_id=a.organization_id
 JOIN organization_memberships m ON m.organization_id=e.organization_id AND m.user_id=e.user_id
 WHERE m.role='student' AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW())
 ),deliveries AS (
 SELECT s.student_id,s.activity_id,s.feedback_at FROM educational_submissions s JOIN eligible e ON e.activity_id=s.activity_id AND e.user_id=s.student_id AND e.organization_id=s.organization_id
 WHERE s.submitted_at>=$3 AND s.submitted_at<$4
 ) SELECT (SELECT COUNT(*)::text FROM activities) AS activities,
 (SELECT COUNT(*)::text FROM eligible) AS eligible_participations,
 (SELECT COUNT(DISTINCT user_id)::text FROM eligible) AS eligible_people,
 (SELECT COUNT(*)::text FROM deliveries) AS submitted,
 (SELECT COUNT(DISTINCT student_id)::text FROM deliveries) AS submitted_people,
 (SELECT COUNT(*)::text FROM deliveries WHERE feedback_at>=$3 AND feedback_at<$4) AS reviewed`,[userId,networkId,window.start,window.end,schoolId??null,teacherId??null,classroomId??null]);return result.rows[0];
}
export async function networkSchoolTeachers(userId:string,networkId:string,schoolId:string){
 return query<{id:string;name:string}>(`WITH schools AS (${reportSchools.replaceAll('$5','$3')})
 SELECT DISTINCT u.id,u.name FROM classroom_teachers ct JOIN users u ON u.id=ct.user_id
 JOIN organization_memberships m ON m.organization_id=ct.organization_id AND m.user_id=ct.user_id
 WHERE ct.organization_id IN(SELECT id FROM schools) AND m.role='teacher' AND m.status='active' AND m.valid_from<=NOW() AND (m.valid_until IS NULL OR m.valid_until>NOW()) ORDER BY u.name,u.id`,[userId,networkId,schoolId]);
}
export async function networkSchoolClasses(userId:string,networkId:string,schoolId:string,teacherId?:string){
 return query<{id:string;name:string}>(`WITH schools AS (${reportSchools.replaceAll('$5','$3')}) SELECT c.id,c.name FROM classrooms c WHERE c.organization_id IN(SELECT id FROM schools)
 AND ($4::text IS NULL OR EXISTS(SELECT 1 FROM classroom_teachers ct WHERE ct.organization_id=c.organization_id AND ct.classroom_id=c.id AND ct.user_id=$4)) ORDER BY c.name,c.id`,[userId,networkId,schoolId,teacherId??null]);
}
