const {createHash}=require('node:crypto');
const DATASET='coonto-education-qa-v1';
const id=key=>{const h=createHash('sha256').update(DATASET+':'+key).digest('hex');return h.slice(0,8)+'-'+h.slice(8,12)+'-4'+h.slice(13,16)+'-a'+h.slice(17,20)+'-'+h.slice(20,32);};
function assertDev(env){if(env.DOMAIN!=='dev.coonto.com'||env.APP_URL!=='https://dev.coonto.com')throw Error('Carga fictícia permitida somente em dev.coonto.com.');}
function makeDataset(now=new Date()){
 const date=days=>new Date(now.getTime()+days*86400000).toISOString();
 const tables={},add=(table,row)=>(tables[table]??=[]).push(row);
 function user(key,name,persona='reader'){const uid=id(key);add('users',{id:uid,email:key+'@qa.coonto.invalid',name:'[TESTE QA] '+name,role:'member',plan:'guest',created_at:date(-45),last_seen_at:date(-2)});add('user_personas',{user_id:uid,persona,status:'active'});return uid;}
 const networks=[0,1].map(n=>{const nid=id('network-'+n);add('education_networks',{id:nid,name:'[TESTE QA] Rede '+(n?'Sul':'Norte')});return nid;});
 const agents=networks.map((network_id,n)=>{
  return ['buyer','viewer','limited'].map(kind=>{const user_id=user(kind+'-'+n,{buyer:'Comprador',viewer:'Gestor de relatórios',limited:'Relatórios sem detalhamento'}[kind]+' Rede '+(n+1));add('education_network_memberships',{network_id,user_id,can_manage_licenses:kind==='buyer',can_view_reports:kind!=='buyer',can_drilldown:kind==='viewer'});return user_id;});
 });
 const schools=[],students=[],teachers=[],managers=[],classes=[],activities=[];
 for(let s=0;s<6;s++){
  const organization_id=id('school-'+s),network_id=networks[Math.floor(s/3)];schools.push(organization_id);
  add('organizations',{id:organization_id,name:'[TESTE QA] Escola '+['Aurora','Horizonte','Ipê','Jatobá','Paineira','Cedro'][s],kind:'school',status:s===5?'paused':'active',created_at:date(-40)});
  add('education_network_schools',{network_id,organization_id,can_allocate_licenses:true,can_share_reports:s!==2,status:'active'});
  const manager=user('manager-'+s,'Gestor Escola '+(s+1),'school_admin');managers.push(manager);add('organization_memberships',{organization_id,user_id:manager,role:'manager',valid_from:date(-30)});
  const staff=[0,1].map(t=>{const uid=user('teacher-'+s+'-'+t,'Professor '+(s+1)+'.'+(t+1),'educator');teachers.push(uid);add('organization_memberships',{organization_id,user_id:uid,role:'teacher',status:s===4&&t===1?'revoked':'active',valid_from:date(-30),valid_until:null,revoked_at:s===4&&t===1?date(-1):null});return uid;});
  for(let c=0;c<3;c++){
   const classroom_id=id('class-'+s+'-'+c);classes.push(classroom_id);add('classrooms',{id:classroom_id,organization_id,name:'[TESTE QA] '+(c+1)+'ª turma · Escola '+(s+1),created_at:date(-30)});const teacher=staff[c===2?1:0];add('classroom_teachers',{organization_id,classroom_id,user_id:teacher});
   const pupils=[];
   for(let p=0;p<10;p++){
    const uid=user('student-'+s+'-'+c+'-'+p,'Aluno '+(s+1)+'.'+(c+1)+'.'+String(p+1).padStart(2,'0'));students.push(uid);pupils.push(uid);
    const status=p===8?'revoked':'active',valid_until=p===9?date(-1):null;
    add('organization_memberships',{organization_id,user_id:uid,role:'student',status,valid_from:date(-30),valid_until,revoked_at:status==='revoked'?date(-1):null});add('classroom_enrollments',{organization_id,classroom_id,user_id:uid});
    if(p%3===0)add('learning_progress',{id:id('progress-'+uid),user_id:uid,work_slug:'o-alienista',screen_index:p,percent:Math.round((p+1)/48*100),state_json:JSON.stringify({idx:p,answers:{},notes:{s0:'[TESTE QA] Nota pessoal: não deve aparecer no relatório escolar.'},visits:{s0:1},updatedAt:now.getTime()})});
   }
   for(let a=0;a<3;a++){
    const activity_id=id('activity-'+s+'-'+c+'-'+a);activities.push(activity_id);add('educational_activities',{id:activity_id,organization_id,classroom_id,created_by:teacher,title:'[TESTE QA] '+['Hipótese sobre o narrador','Evidência do texto','Conexão com a obra'][a],instructions:'Dados fictícios. Justifique uma hipótese com uma passagem do texto. Escola '+(s+1)+', turma '+(c+1)+'.',status:a===2?'closed':'open',created_at:date(a===2?-40:-1)});
    for(let p=0;p<7;p++)add('educational_submissions',{organization_id,activity_id,student_id:pupils[p],body:'[TESTE QA] Resposta fictícia '+(p+1)+' da turma '+(c+1)+'.',submitted_at:date(a===2?-39:0),feedback:p<4?'[TESTE QA] Compare sua hipótese com a passagem indicada.':null,feedback_by:p<4?teacher:null,feedback_at:p<4?date(a===2?-38:0):null});
   }
  }
 }
 // One person participates in multiple classes and schools; identities remain unique.
 add('classroom_enrollments',{organization_id:schools[0],classroom_id:classes[1],user_id:students[0]});
 add('organization_memberships',{organization_id:schools[1],user_id:teachers[0],role:'teacher'});add('classroom_teachers',{organization_id:schools[1],classroom_id:classes[3],user_id:teachers[0]});
 add('organization_memberships',{organization_id:schools[1],user_id:students[0],role:'student'});add('classroom_enrollments',{organization_id:schools[1],classroom_id:classes[3],user_id:students[0]});
 const future=user('future-student','Aluno com vínculo futuro');add('organization_memberships',{organization_id:schools[0],user_id:future,role:'student',valid_from:date(2)});add('classroom_enrollments',{organization_id:schools[0],classroom_id:classes[0],user_id:future});
 const unassigned=user('unassigned-teacher','Professor sem turma','educator');add('organization_memberships',{organization_id:schools[0],user_id:unassigned,role:'teacher'});
 const guest=user('unassigned-reader','Leitor sem escola');
 const contracts=[];
 for(let n=0;n<2;n++)for(const [k,slug] of ['o-alienista','memorias-de-martha','divina-comedia-canto-i'].entries()){
  const cid=id('contract-'+n+'-'+k);contracts.push(cid);add('education_license_contracts',{id:cid,network_id:networks[n],work_slug:slug,reference:'[TESTE QA] Contrato '+(n+1)+'.'+(k+1),seats:60,status:n===1&&k===2?'revoked':'active',valid_from:date(-30),valid_until:n===0&&k===1?date(-1):date(30)});
  for(let s=n*3;s<n*3+3;s++){
   add('education_license_allocations',{contract_id:cid,organization_id:schools[s],seats:20});
   for(let p=0;p<(k===0?20:4);p++){const uid=students[s*30+p];add('education_license_grants',{id:id('grant-'+n+'-'+k+'-'+s+'-'+p),contract_id:cid,organization_id:schools[s],user_id:uid,status:p===19?'revoked':'active',created_at:date(-2),activated_at:p<8?date(-1):null,used_at:p<5?date(-1):null});}
  }
 }
 // A full school quota and a personal right survive independent institutional changes.
 const full=id('contract-full');contracts.push(full);add('education_license_contracts',{id:full,network_id:networks[0],work_slug:'divina-comedia-canto-i',reference:'[TESTE QA] Limite esgotado',seats:1,status:'active',valid_from:date(-1),valid_until:date(30)});add('education_license_allocations',{contract_id:full,organization_id:schools[0],seats:1});add('education_license_grants',{id:id('grant-full'),contract_id:full,organization_id:schools[0],user_id:students[0],status:'active',activated_at:null,used_at:null});
 add('entitlements',{id:id('personal'),user_id:students[9],work_slug:'o-alienista',source:'qa-fiction',status:'active'});
 const edges={future,unassigned,guest,revokedTeacher:teachers[9],expiredStudent:students[9],revokedStudent:students[8],full};
 return {key:DATASET,createdAt:now.toISOString(),tables,actors:{networks,agents,schools,students,teachers,managers,classes,activities,contracts,edges},counts:Object.fromEntries(Object.entries(tables).map(([t,rows])=>[t,rows.length]))};
}
async function loadDataset(client,env,now=new Date()){
 assertDev(env);const data=makeDataset(now);
 await client.query('BEGIN');
 try{
  await client.query('SELECT pg_advisory_xact_lock(190006)');
  await client.query('CREATE TABLE IF NOT EXISTS coonto_qa_datasets (key TEXT PRIMARY KEY, loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), manifest JSONB NOT NULL)');
  const prior=await client.query('SELECT manifest FROM coonto_qa_datasets WHERE key=$1',[DATASET]);
  if(prior.rows[0]){await client.query('COMMIT');return {status:'already-loaded',manifest:prior.rows[0].manifest};}
  // Plain inserts: any collision aborts the entire batch; no real row is updated.
  for(const [table,rows] of Object.entries(data.tables)){
   const groups=new Map();for(const row of rows){const columns=Object.keys(row).sort(),key=columns.join(',');if(!groups.has(key))groups.set(key,{columns,rows:[]});groups.get(key).rows.push(row);}
   for(const group of groups.values())for(let offset=0;offset<group.rows.length;offset+=80){const chunk=group.rows.slice(offset,offset+80),params=[];const values=chunk.map(row=>'('+group.columns.map(column=>{params.push(row[column]);return '$'+params.length;}).join(',')+')').join(',');
    await client.query('INSERT INTO '+table+' ('+group.columns.join(',')+') VALUES '+values,params);
   }
  }
  const composite={user_personas:['user_id','persona'],education_network_memberships:['network_id','user_id'],education_network_schools:['network_id','organization_id'],organization_memberships:['organization_id','user_id'],classroom_teachers:['classroom_id','user_id'],classroom_enrollments:['classroom_id','user_id'],educational_submissions:['activity_id','student_id'],education_license_allocations:['contract_id','organization_id']};
  const manifest={...data,keys:Object.fromEntries(Object.entries(data.tables).map(([table,rows])=>[table,rows.map(row=>Object.fromEntries((row.id?['id']:composite[table]).map(key=>[key,row[key]])))]))};delete manifest.tables;
  await client.query('INSERT INTO coonto_qa_datasets(key,manifest) VALUES($1,$2::jsonb)',[DATASET,JSON.stringify(manifest)]);await client.query('COMMIT');return {status:'loaded',manifest};
 }catch(error){await client.query('ROLLBACK');throw error;}
}
module.exports={DATASET,id,assertDev,makeDataset,loadDataset};
