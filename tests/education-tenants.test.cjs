const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
let db;
function load(file,mocks){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports,module:mod,require:n=>mocks[n]||require(n),process,console,crypto:require("node:crypto").webcrypto});return mod.exports;}
const query=(sql,params)=>db.query(sql,params);
const contexts=load('lib/education-context.ts',{'@/lib/db':{query}});
const activities=load('lib/educational-activities.ts',{'@/lib/db':{query}});
before(async()=>{
 db=new PGlite();for(let round=0;round<2;round++)for(const file of fs.readdirSync('db/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('db/migrations/'+file,'utf8'));
 await db.exec(`INSERT INTO users(id,email,name) VALUES('teacher','t@test.invalid','Teacher'),('other','o@test.invalid','Other'),('manager','m@test.invalid','Manager'),('student','s@test.invalid','Student'),('outside','x@test.invalid','Outside'),('owner','a@test.invalid','Owner');
 INSERT INTO organizations(id,name,kind) VALUES('X','School X','school'),('Y','School Y','school');
 INSERT INTO organization_memberships(organization_id,user_id,role) VALUES('X','teacher','teacher'),('Y','teacher','teacher'),('X','other','teacher'),('X','manager','manager'),('X','student','student'),('Y','outside','student');
 INSERT INTO classrooms(id,organization_id,name) VALUES('cx','X','Class X'),('cz','X','Class Z'),('cy','Y','Class Y');
 INSERT INTO classroom_teachers(organization_id,classroom_id,user_id) VALUES('X','cx','teacher'),('X','cz','other'),('Y','cy','teacher');
 INSERT INTO classroom_enrollments(organization_id,classroom_id,user_id) VALUES('X','cx','student'),('Y','cy','outside');`);
});
after(async()=>await db.close());
test('vários vínculos exigem seleção; identificador de outra instituição não muda escopo',async()=>{
 const choices=await contexts.educationContexts('teacher');assert.equal(choices.length,2);
 assert.equal(contexts.selectEducationContext(choices),null);assert.equal(contexts.selectEducationContext(choices,'unknown'),null);
 const x=contexts.selectEducationContext(choices,'X');assert.equal(x.id,'X');
 assert.deepEqual((await contexts.contextClassrooms('teacher',x)).rows.map(c=>c.id),['cx']);
 assert.equal((await contexts.contextClassrooms('owner',x)).rows.length,0);
});
test('atividade, entrega e devolutiva respeitam turma e instituição em cada operação',async()=>{
 assert.equal(await activities.createActivity('teacher','X','cy','Cross tenant','Instructions'),false);
 assert.equal(await activities.createActivity('teacher','X','cz','Other class','Instructions'),false);
 assert.equal(await activities.createActivity('owner','X','cx','Owner','Instructions'),false);
 assert.equal(await activities.createActivity('teacher','X','cx','Reading response','Explain the scene'),true);
 const [a]=(await activities.staffActivities('teacher','X')).rows;assert.ok(a);
 assert.equal(await activities.submitActivity('outside',a.id,'Forbidden'),false);
 assert.equal(await activities.submitActivity('student',a.id,'My institutional answer'),true);
 assert.equal((await activities.studentActivities('outside')).rows.length,0);
 assert.equal((await activities.staffSubmissions('other','X',a.id)).rows.length,0);
 assert.equal(await activities.giveFeedback('teacher','Y',a.id,'student','Wrong tenant'),false);
 assert.equal(await activities.giveFeedback('other','X',a.id,'student','Wrong class'),false);
 assert.equal(await activities.giveFeedback('teacher','X',a.id,'student','Consider the narrator'),true);
 assert.equal((await activities.studentActivities('student')).rows[0].feedback,'Consider the narrator');
 assert.equal(await activities.submitActivity('student',a.id,'Revised response'),true);
 assert.equal((await activities.studentActivities('student')).rows[0].feedback,null);
 const manager=(await activities.staffActivities('manager','X')).rows;assert.equal(manager[0].submitted,'1');assert.equal(manager[0].reviewed,'0');
});
test('revogação e expiração interrompem leituras e escritas mesmo com contexto antigo',async()=>{
 const [a]=(await activities.staffActivities('teacher','X')).rows;
 await query("UPDATE organization_memberships SET status='revoked',revoked_at=NOW() WHERE organization_id='X' AND user_id='teacher'");
 assert.equal((await contexts.educationContexts('teacher')).length,1);
 assert.equal((await activities.staffActivities('teacher','X')).rows.length,0);
 assert.equal(await activities.giveFeedback('teacher','X',a.id,'student','Revoked'),false);
 await query("UPDATE organization_memberships SET valid_until=NOW()-INTERVAL '1 day' WHERE organization_id='X' AND user_id='student'");
 assert.equal((await activities.studentActivities('student')).rows.length,0);
 assert.equal(await activities.submitActivity('student',a.id,'Expired'),false);
 await query("UPDATE organizations SET status='paused' WHERE id='Y'");assert.equal((await contexts.educationContexts('teacher')).length,0);
});
test('painel institucional não consulta nem copia progresso e notas pessoais',()=>{
 for(const file of ['app/gestao-escolar/page.tsx','lib/educational-activities.ts','db/migrations/018_institutional_activities.sql']){
 const source=fs.readFileSync(file,'utf8');assert.equal(/FROM\s+(?:rc_)?learning_progress|JOIN\s+(?:rc_)?learning_progress|INSERT INTO\s+(?:rc_)?learning_progress/i.test(source),false);
 }
});
test('CRM revoga e reativa vínculo com auditoria na mesma transação',async()=>{
 const transaction=async work=>{await db.exec('BEGIN');try{const result=await work({query});await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}};
 const actions=load('app/backoffice/crm/actions.ts',{'next/cache':{revalidatePath:()=>{}},'next/navigation':{redirect:()=>{throw new Error('redirect')}},'@/lib/auth':{requireUser:async()=>({userId:'owner',role:'admin'})},'@/lib/admin-host':{requireCrmHost:async()=>{}},'@/lib/db':{query},'@/lib/transaction':{transaction},'@/lib/crm-events':{recordCrmEvent:async()=>{}},'@/lib/member':{ALIENISTA_SLUG:'o-alienista'}});
 for(const status of ['active','revoked']){
  const form=new FormData();form.set('organization_id','X');form.set('user_id','teacher');form.set('status',status);
  await assert.rejects(()=>actions.changeMembershipAccess(form),/redirect/);
  assert.equal((await query("SELECT status FROM organization_memberships WHERE organization_id='X' AND user_id='teacher'")).rows[0].status,status);
 }
 const events=await query("SELECT user_id,organization_id,related_id FROM crm_events WHERE event_type='membership_access_changed'");
 assert.equal(events.rows.length,2);assert.ok(events.rows.every(e=>e.user_id==='owner'&&e.organization_id==='X'&&e.related_id==='teacher'));
});
