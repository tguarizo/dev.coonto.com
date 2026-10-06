const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');const {assertDev,makeDataset,loadDataset,id}=require('../scripts/qa/education-dataset.cjs');
const env={DOMAIN:'dev.coonto.com',APP_URL:'https://dev.coonto.com'};let db,data;
function load(file,mocks){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports,module:mod,require:n=>mocks[n]||require(n),process,console,Date,Intl,crypto:require('node:crypto').webcrypto});return mod.exports;}
const query=(sql,values)=>db.query(sql,values);const transaction=async work=>{await db.exec('BEGIN');try{const result=await work({query});await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}};
let contexts,activities,network,reports,licenses,access;
before(async()=>{db=await PGlite.create();for(const file of fs.readdirSync('db/migrations').filter(x=>x.endsWith('.sql')).sort())await db.exec(fs.readFileSync('db/migrations/'+file,'utf8'));
 await query("INSERT INTO users(id,email,name,role) VALUES('real-admin','real@example.test','Existing administrator','admin')");data=makeDataset();
 contexts=load('lib/education-context.ts',{'@/lib/db':{query}});activities=load('lib/educational-activities.ts',{'@/lib/db':{query}});network=load('lib/education-network.ts',{'@/lib/db':{query}});reports=load('lib/education-reports.ts',{'@/lib/db':{query},'@/lib/education-network':network});access=load('lib/institutional-license-access.ts',{'@/lib/db':{query},'@/lib/education-network':network});licenses=load('lib/education-licenses.ts',{'@/lib/db':{query},'@/lib/transaction':{transaction},'@/lib/education-network':network,'@/lib/institutional-license-access':access,'@/lib/free-works':load('lib/free-works.ts',{})});
});after(async()=>await db.close());
test('carga recusa produção antes de executar SQL',async()=>{let called=false;for(const e of [{DOMAIN:'coonto.com',APP_URL:'https://coonto.com'},{DOMAIN:'dev.coonto.com',APP_URL:'https://coonto.com'},{}]){assert.throws(()=>assertDev(e));await assert.rejects(()=>loadDataset({query:async()=>{called=true;}},e));}assert.equal(called,false);});
test('colisão não sobrescreve conta existente e desfaz a carga inteira',async()=>{
 await query('INSERT INTO users(id,email,name) VALUES($1,$2,$3)',[id('buyer-0'),'collision@example.test','Preserve me']);await assert.rejects(()=>loadDataset({query},env));assert.equal((await query('SELECT COUNT(*)::int AS n FROM organizations')).rows[0].n,0);assert.equal((await query('SELECT COUNT(*)::int AS n FROM education_networks')).rows[0].n,0);assert.equal((await query('SELECT name FROM users WHERE id=$1',[id('buyer-0')])).rows[0].name,'Preserve me');await query('DELETE FROM users WHERE id=$1',[id('buyer-0')]);
});
test('carga completa é atômica, identificada e idempotente sem autenticar pessoas',async()=>{
 const result=await loadDataset({query},env);assert.equal(result.status,'loaded');data=result.manifest;assert.equal(data.counts.organizations,6);assert.equal(data.counts.classrooms,18);assert.equal(data.actors.students.length,180);
 for(const [table,count] of Object.entries(data.counts)){const total=(await query('SELECT COUNT(*)::int AS n FROM '+table)).rows[0].n;assert.equal(total,count+(table==='users'?1:0),table);}
 assert.equal((await query("SELECT COUNT(*)::int AS n FROM users WHERE role='admin'")).rows[0].n,1);assert.equal((await query('SELECT COUNT(*)::int AS n FROM sessions')).rows[0].n,0);assert.equal((await query('SELECT COUNT(*)::int AS n FROM login_codes')).rows[0].n,0);
 await query("UPDATE organizations SET name='[TESTE QA] editada manualmente' WHERE id=$1",[data.actors.schools[0]]);assert.equal((await loadDataset({query},env)).status,'already-loaded');assert.equal((await query('SELECT name FROM organizations WHERE id=$1',[data.actors.schools[0]])).rows[0].name,'[TESTE QA] editada manualmente');
});
function current(m,now=new Date()){return (m.status??'active')==='active'&&(!m.valid_from||new Date(m.valid_from)<=now)&&(!m.valid_until||new Date(m.valid_until)>now);}
test('todas as contas respeitam vínculo, vigência, instituição e turma atribuída',async()=>{
 const source=makeDataset(new Date(data.createdAt)),t=source.tables;
 for(const user of t.users){
  const memberships=t.organization_memberships.filter(m=>m.user_id===user.id&&current(m));const staff=memberships.filter(m=>m.role!=='student'&&t.organizations.find(o=>o.id===m.organization_id).status==='active');
  assert.deepEqual((await contexts.educationContexts(user.id)).map(x=>x.id).sort(),staff.map(x=>x.organization_id).sort(),user.name);
  for(const school of t.organizations){
   const member=staff.find(m=>m.organization_id===school.id);const assigned=t.classroom_teachers.filter(c=>c.user_id===user.id&&c.organization_id===school.id).map(c=>c.classroom_id);const expected=member?t.classrooms.filter(c=>c.organization_id===school.id&&(member.role==='manager'||assigned.includes(c.id))).map(c=>c.id).sort():[];
   assert.deepEqual((await contexts.contextClassrooms(user.id,{id:school.id,role:member?.role||'teacher'})).rows.map(x=>x.id).sort(),expected,user.name+' / '+school.name);
  }
  const eligible=t.classroom_enrollments.filter(e=>e.user_id===user.id&&memberships.some(m=>m.role==='student'&&m.organization_id===e.organization_id)&&t.organizations.find(o=>o.id===e.organization_id).status==='active');const expected=t.educational_activities.filter(a=>eligible.some(e=>e.classroom_id===a.classroom_id&&e.organization_id===a.organization_id)).map(a=>a.id).sort();assert.deepEqual((await activities.studentActivities(user.id)).rows.map(x=>x.id).sort(),expected,user.name);
 }
});
test('relatórios batem com uma apuração independente das pessoas e participações',async()=>{
 const t=makeDataset(new Date(data.createdAt)).tables,w=reports.reportWindow();
 for(const [n,nid] of data.actors.networks.entries())for(const [i,uid] of data.actors.agents[n].entries()){
  const allowed=t.education_network_schools.filter(s=>s.network_id===nid&&s.can_share_reports&&current(s)&&t.organizations.find(o=>o.id===s.organization_id).status==='active').map(s=>s.organization_id);
  const acts=i===0?[]:t.educational_activities.filter(a=>allowed.includes(a.organization_id)&&new Date(a.created_at)>=w.start&&new Date(a.created_at)<w.end);
  const eligible=acts.flatMap(a=>t.classroom_enrollments.filter(e=>e.classroom_id===a.classroom_id&&e.organization_id===a.organization_id&&t.organization_memberships.some(m=>m.organization_id===e.organization_id&&m.user_id===e.user_id&&m.role==='student'&&current(m))).map(e=>({activity:a.id,user:e.user_id})));
  const delivered=t.educational_submissions.filter(s=>eligible.some(e=>e.activity===s.activity_id&&e.user===s.student_id)&&new Date(s.submitted_at)>=w.start&&new Date(s.submitted_at)<w.end);
  const expected={activities:String(acts.length),eligible_participations:String(eligible.length),eligible_people:String(new Set(eligible.map(e=>e.user)).size),submitted:String(delivered.length),submitted_people:String(new Set(delivered.map(s=>s.student_id)).size),reviewed:String(delivered.filter(s=>s.feedback_at&&new Date(s.feedback_at)>=w.start&&new Date(s.feedback_at)<w.end).length)};
  const actual=await reports.networkReport(uid,nid,w);for(const [key,value] of Object.entries(expected))assert.equal(actual[key],value,key+' / '+uid);
  assert.equal(JSON.stringify(actual).includes('Nota pessoal'),false);if(i===2)assert.equal((await reports.networkReport(uid,nid,w,allowed[0])).activities,'0');
 }
});
test('escritas cruzadas, turmas não atribuídas e atividades encerradas não aceitam entregas',async()=>{
 const a=data.actors,s=a.schools[0],teacher=a.teachers[0],student=a.students[0];
 assert.equal(await activities.createActivity(teacher,s,a.classes[2],'[TESTE QA] turma não atribuída','Instruções fictícias'),false);assert.equal(await activities.createActivity(teacher,s,a.classes[6],'[TESTE QA] outra rede','Instruções fictícias'),false);assert.equal(await activities.submitActivity(a.students[30],a.activities[0],'Tentativa cruzada'),false);assert.equal(await activities.submitActivity(student,a.activities[2],'Atividade encerrada'),false);assert.equal(await activities.submitActivity(a.edges.future,a.activities[0],'Vínculo futuro'),false);assert.equal(await activities.submitActivity(a.edges.revokedStudent,a.activities[0],'Vínculo revogado'),false);
 assert.equal(await activities.submitActivity(student,a.activities[0],'[TESTE QA] Entrega revisada'),true);assert.equal((await activities.studentActivities(student)).rows.find(x=>x.id===a.activities[0]).feedback,null);assert.equal(await activities.giveFeedback(teacher,s,a.activities[0],student,'[TESTE QA] Nova devolutiva'),true);
});
test('limite, vigência e contrato revogado são reavaliados sem substituir direito pessoal',async()=>{
 const a=data.actors;assert.equal(await licenses.assignInstitutionalLicense(a.agents[0][0],a.schools[0],a.edges.full,a.students[1]),false);assert.equal(await licenses.allocateSchoolSeats(a.agents[0][0],a.networks[0],a.edges.full,a.schools[1],1),false);assert.equal(await access.institutionalWorkAccess(a.students[0],'memorias-de-martha'),null);assert.equal(await access.institutionalWorkAccess(a.students[90],'divina-comedia-canto-i'),null);assert.equal(await access.institutionalWorkAccess(a.students[159],'o-alienista'),null);
 assert.ok(await access.institutionalWorkAccess(a.students[0],'o-alienista'));await query("UPDATE organization_memberships SET status='revoked' WHERE user_id=$1",[a.students[0]]);assert.equal(await access.institutionalWorkAccess(a.students[0],'o-alienista'),null);
 const member=load('lib/member.ts',{'@/lib/db':{query},'@/lib/auth':{getCurrentUser:async()=>null},'@/lib/institutional-license-access':access});assert.equal((await member.ensureWorkEntitlement(a.edges.expiredStudent,'o-alienista')).id,id('personal'));
});
