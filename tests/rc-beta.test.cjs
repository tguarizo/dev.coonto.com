const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
let db,user=null;
const schema=load('lib/rc-schema.ts');
const origin=load('lib/request-origin.ts');
const defaults=Object.fromEntries(schema.rcSlugs.map(slug=>[slug,schema.rcWorkSchema.parse(require('../content/rc-'+slug+'.json'))]));
function load(file,mocks={}){const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(source,{exports:mod.exports,module:mod,require:name=>mocks[name]||(name==='@/scripts/rc-audio.cjs'?require('../scripts/rc-audio.cjs'):require(name)),process,Buffer,console,Response,Request,URL,crypto});return mod.exports;}
const query=(sql,params)=>db.query(sql,params);
const dbMock={query,getPool:()=>({connect:async()=>({query,release(){}})})};
const content=load('lib/rc-content.ts',{'@/content/rc-memorias-de-martha.json':defaults['memorias-de-martha'],'@/content/rc-divina-comedia-canto-i.json':defaults['divina-comedia-canto-i'],'@/lib/rc-schema':schema,'@/lib/db':dbMock});
const network=load('lib/education-network.ts',{'@/lib/db':dbMock});
const licenseAccess=load('lib/institutional-license-access.ts',{'@/lib/db':dbMock,'@/lib/education-network':network});
const permissions={curator:[{work_slug:'memorias-de-martha',can_comment:true,can_approve:false,can_publish:false}],approver:[{work_slug:'memorias-de-martha',can_comment:false,can_approve:true,can_publish:false}],publisher:[{work_slug:'memorias-de-martha',can_comment:false,can_approve:false,can_publish:true}]};
const auth={getCurrentUser:async()=>user};
const progress=load('app/api/rc/progress/[slug]/route.ts',{'@/lib/request-origin':origin,'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/rc-schema':schema,'@/lib/rc-content':content});
const editor=load('app/api/rc/editor/route.ts',{'@/lib/request-origin':origin,'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/rc-schema':schema,'@/lib/rc-content':content,'@/lib/access-control':{getAccessProfile:async u=>({canUseCulturalCrm:u.role==='admin'||Boolean(permissions[u.userId]),globalOperation:u.role==='admin'}),culturalScope:async id=>permissions[id]||[]}});
const context=slug=>({params:Promise.resolve({slug})});
const request=(body,origin='https://coonto.test')=>new Request('https://coonto.test/api/rc',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const state=()=>({unit:0,stage:1,visited:['0:0','0:1'],answers:{'0':1},notes:{'0:1':'Nota privada da conta A'}});
const account=id=>({userId:id,role:id==='owner'?'admin':'member',authenticatedAt:new Date().toISOString()});
before(async()=>{db=new PGlite();for(let round=0;round<2;round++)for(const file of fs.readdirSync('db/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('db/migrations/'+file,'utf8'));for(const id of ['A','B','owner','curator','approver','publisher'])await query('INSERT INTO users(id,email,name) VALUES($1,$2,$1)',[id,id+'@test.invalid']);process.env.DATABASE_URL='test-in-memory';});
after(async()=>{delete process.env.DATABASE_URL;await db.close();});
test('fontes cobrem os 12 capítulos e todos os versos sem lacunas; retornos são próprios',()=>{
 assert.equal(defaults['memorias-de-martha'].units.length,12);assert.equal(defaults['divina-comedia-canto-i'].units.length,6);
 assert.equal(require('../content/inferno-i-verses.json').length,136);
 for(const work of Object.values(defaults)){for(let i=0;i<work.units.length;i++){const u=work.units[i];assert.equal(new Set(u.options.map(o=>o.consequence)).size,3);assert.ok(u.sourceEnd>=u.sourceStart);if(i&&work.source.kind==='verses')assert.equal(u.sourceStart,work.units[i-1].sourceEnd+1);} }
 assert.equal(defaults['memorias-de-martha'].units.at(-1).sourceEnd,166);
 assert.equal(defaults['divina-comedia-canto-i'].units.at(-1).sourceEnd,136);
});
test('visitantes não leem nem gravam progresso privado',async()=>{user=null;assert.equal((await progress.GET(new Request('https://coonto.test'),context('memorias-de-martha'))).status,401);assert.equal((await progress.POST(request({}),context('memorias-de-martha'))).status,401);});
test('progresso retoma por conta, separa obras e impede sobrescrita entre abas',async()=>{
 user=account('A');const body={state:state(),revision:0,contentVersion:defaults['memorias-de-martha'].version};let result=await progress.POST(request(body),context('memorias-de-martha'));assert.equal(result.status,200);assert.equal((await result.json()).revision,1);
 assert.equal((await progress.POST(request(body),context('memorias-de-martha'))).status,409);
 body.revision=1;body.state.stage=2;body.state.visited.push('0:2');result=await progress.POST(request(body),context('memorias-de-martha'));assert.equal((await result.json()).revision,2);
 const loaded=await (await progress.GET(new Request('https://coonto.test'),context('memorias-de-martha'))).json();assert.equal(loaded.progress.state.notes['0:1'],'Nota privada da conta A');
 user=account('B');assert.equal((await (await progress.GET(new Request('https://coonto.test'),context('memorias-de-martha'))).json()).progress,null);
 user=account('A');assert.equal((await (await progress.GET(new Request('https://coonto.test'),context('divina-comedia-canto-i'))).json()).progress,null);
});
test('recusa ID de outra conta, etapas fora da obra, edição antiga e origem externa',async()=>{
 user=account('A');const body={state:state(),revision:2,contentVersion:defaults['memorias-de-martha'].version};
 assert.equal((await progress.POST(request({...body,userId:'B'}),context('memorias-de-martha'))).status,400);
 assert.equal((await progress.POST(request({...body,contentVersion:defaults['divina-comedia-canto-i'].version,state:{...state(),unit:9}}),context('divina-comedia-canto-i'))).status,400);
 assert.equal((await progress.POST(request({...body,contentVersion:'old'}),context('memorias-de-martha'))).status,409);
 assert.equal((await progress.POST(request(body,'https://external.test'),context('memorias-de-martha'))).status,403);
});
let draft;
test('curador somente vê e edita a obra atribuída; criação não publica',async()=>{
 user=account('curator');const response=await editor.GET();const body=await response.json();assert.equal(body.defaults.length,1);assert.equal(body.defaults[0].slug,'memorias-de-martha');
 assert.equal((await editor.POST(request({action:'draft',slug:'divina-comedia-canto-i',content:defaults['divina-comedia-canto-i']}))).status,403);
 const result=await editor.POST(request({action:'draft',slug:'memorias-de-martha',content:defaults['memorias-de-martha']}));assert.equal(result.status,200);draft=(await result.json()).id;
 assert.equal((await editor.POST(request({action:'approve',id:draft}))).status,403);
 assert.equal((await query('SELECT status FROM rc_content_versions WHERE id=$1',[draft])).rows[0].status,'draft');
});
test('publicação exige aprovação e permissão; versão publicada mantém fonte e histórico',async()=>{
 user=account('publisher');assert.equal((await editor.POST(request({action:'publish',id:draft}))).status,409);
 user=account('approver');assert.equal((await editor.POST(request({action:'approve',id:draft}))).status,200);assert.equal((await editor.POST(request({action:'publish',id:draft}))).status,403);
 user=account('publisher');assert.equal((await editor.POST(request({action:'publish',id:draft}))).status,200);assert.equal((await content.getRcWork('memorias-de-martha')).version,draft);
 user=account('owner');const changed=structuredClone(defaults['memorias-de-martha']);changed.units[0].context+=' Revisão de teste.';const result=await editor.POST(request({action:'draft',slug:changed.slug,content:changed}));const second=(await result.json()).id;await editor.POST(request({action:'approve',id:second}));assert.equal((await editor.POST(request({action:'publish',id:second}))).status,200);assert.equal((await query("SELECT COUNT(*)::int AS n FROM rc_content_versions WHERE status='published'")).rows[0].n,1);assert.equal((await query('SELECT status FROM rc_content_versions WHERE id=$1',[draft])).rows[0].status,'archived');
});
test('edição preserva fonte, licença e IDs; notas privadas não saem no CRM',async()=>{
 user=account('owner');for(const mutation of [w=>w.source.href='https://wrong.test',w=>w.units[0].id='cap-2',w=>w.units.pop()]){const work=structuredClone(defaults['memorias-de-martha']);mutation(work);assert.equal((await editor.POST(request({action:'draft',slug:work.slug,content:work}))).status,400);}
 assert.equal(JSON.stringify(await (await editor.GET()).json()).includes('Nota privada da conta A'),false);
 user=account('B');assert.equal((await editor.GET()).status,403);
});
test('licença expirada é negada e IDs das cenas finais de áudio são aceitos',async()=>{
 const member=load('lib/member.ts',{'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/institutional-license-access':licenseAccess});await query("INSERT INTO entitlements(id,user_id,work_slug,expires_at) VALUES('expired','A','o-alienista',NOW()-INTERVAL '1 minute')");assert.equal(await member.ensureAlienistaEntitlement('A'),null);await query("UPDATE entitlements SET expires_at=NOW()+INTERVAL '1 day' WHERE id='expired'");assert.equal((await member.ensureAlienistaEntitlement('A')).id,'expired');
 for(const scene of ['c1','c4','final'])await query("INSERT INTO coonto_audio_jobs(id,scene_id,segments,model,characters) VALUES($1,$1,'[]','test',1)",[scene]);
});
test('gestão exige turma do contexto e preserva leitura pessoal',async()=>{
 await db.exec("INSERT INTO organizations(id,name,kind) VALUES('X','Escola X','school'),('Y','Escola Y','school'); INSERT INTO organization_memberships(organization_id,user_id,role) VALUES('X','curator','manager'),('X','publisher','teacher'),('X','A','student'),('Y','approver','teacher'),('Y','B','student'); INSERT INTO classrooms(id,organization_id,name) VALUES('classX','X','Turma X'),('classY','Y','Turma Y'); INSERT INTO classroom_teachers(organization_id,classroom_id,user_id) VALUES('X','classX','publisher'),('Y','classY','approver'); INSERT INTO classroom_enrollments(organization_id,classroom_id,user_id) VALUES('X','classX','A'),('Y','classY','B');");
 const contexts=load('lib/education-context.ts',{'@/lib/db':dbMock}),activities=load('lib/educational-activities.ts',{'@/lib/db':dbMock});
 const page=load('app/gestao-escolar/page.tsx',{'@/lib/auth':{requireUser:async()=>user},'@/lib/education-context':contexts,'@/lib/educational-activities':activities,'@/components/education-sidebar':{EducationSidebar:()=>null},'@/lib/education-session':{requireEducationVerification:()=>{}},'./actions':{publishActivity:async()=>{},sendFeedback:async()=>{}},'../backoffice/crm/styles.css':{},'next/navigation':{notFound:()=>{throw new Error('404')},redirect:()=>{throw new Error('redirect')}},'@/components/site-header':{SiteHeader:()=>null},'@/components/site-footer':{SiteFooter:()=>null}});
 const {renderToStaticMarkup}=require('react-dom/server');
 for(const id of ['curator','publisher']){user=account(id);await assert.rejects(()=>page.default({searchParams:Promise.resolve({instituicao:'X',turma:'classY'})}),/404/);const html=renderToStaticMarkup(await page.default({searchParams:Promise.resolve({instituicao:'X'})}));assert.ok(html.includes('Turma X'));assert.equal(html.includes('Turma Y'),false);assert.equal(html.includes('Nota privada'),false);assert.equal(html.includes('A@test.invalid'),false);assert.equal(html.includes('etapas visitadas'),false);}
 user=account('approver');const other=renderToStaticMarkup(await page.default({searchParams:Promise.resolve({})}));assert.ok(other.includes('Turma Y'));assert.equal(other.includes('Turma X'),false);
});
test('áudio RC corresponde ao texto e à voz; versão antiga não sobrescreve abertura atual',async()=>{
 const dir=fs.mkdtempSync(require('node:path').join(require('node:os').tmpdir(),'rc-audio-'));
 const audio=load('lib/audio-production.ts',{'@/lib/db':dbMock,'@/lib/rc-content':content,'@/lib/work-audio':{audioDirectory:()=>dir},'@/lib/crm-events':{recordCrmEvent:async()=>{}}});
 const work=await content.getRcWork('memorias-de-martha');const unit=work.units[0];const text=unit.title+'. '+unit.context;const segments=[{speaker:'narrator',text,voiceId:'czvzJwIVS2asEKnthV40'}];
 assert.equal(audio.audioInput.safeParse({workSlug:'divina-comedia-canto-i',sceneId:'cap-1',segments}).success,false);
 await assert.rejects(()=>audio.produceAudio({workSlug:work.slug,sceneId:unit.id,segments:[{speaker:'narrator',text:'Texto diferente'}]},'owner'),/corresponder/);
 const id=crypto.randomUUID();await query("INSERT INTO coonto_audio_jobs(id,work_slug,scene_id,segments,model,characters,status) VALUES($1,$2,$3,$4::jsonb,'eleven_multilingual_v2',$5,'ready')",[id,work.slug,unit.id,JSON.stringify(segments),text.length]);fs.mkdirSync(dir+'/drafts',{recursive:true});fs.writeFileSync(dir+'/drafts/'+id+'.mp3',Buffer.from('ID3-test-audio'));
 await audio.publishAudio(id,'owner');const manifest=JSON.parse(fs.readFileSync(dir+'/beta-audio-manifest.json','utf8'));assert.equal(manifest.items[work.slug+'/'+unit.id].hash,require('node:crypto').createHash('sha256').update(JSON.stringify({model:'eleven_multilingual_v2',segments})).digest('hex'));
 const route=load('app/api/audio/rc/[slug]/[unit]/route.ts',{'@/lib/work-audio':{audioDirectory:()=>dir},'@/lib/audio-production':audio,'@/lib/rc-schema':schema,'@/lib/rc-content':content});const params={params:Promise.resolve({slug:work.slug,unit:unit.id})};const response=await route.GET(new Request('https://coonto.test/audio',{headers:{range:'bytes=0-2'}}),params);assert.equal(response.status,206);assert.equal(await response.text(),'ID3');assert.equal((await route.GET(new Request('https://coonto.test/audio',{headers:{range:'bytes=999-'}}),params)).status,416);
 await query("UPDATE coonto_audio_jobs SET segments=$2::jsonb WHERE id=$1",[id,JSON.stringify([{...segments[0],text:'Antiga abertura'}])]);await assert.rejects(()=>audio.publishAudio(id,'owner'),/conteúdo mudou/);
 for(const file of ['015_audio_scene_ids.sql','016_rc_audio.sql'])await db.exec(fs.readFileSync('db/migrations/'+file,'utf8'));
 fs.rmSync(dir,{recursive:true,force:true});
});

test('origem pública é validada atrás do proxy sem aceitar outro domínio',()=>{
 const headers={host:'coonto.test','x-forwarded-proto':'https',origin:'https://coonto.test'};
 assert.equal(origin.sameRequestOrigin(new Request('http://localhost:3000/api/rc',{headers})),true);
 assert.equal(origin.sameRequestOrigin(new Request('http://localhost:3000/api/rc',{headers:{...headers,origin:'https://evil.test'}})),false);
 assert.equal(origin.sameRequestOrigin(new Request('http://localhost:3000/api/rc',{headers:{...headers,origin:'null'}})),false);
});

test('pedido gratuito permite escolher qualquer das três obras, sem duplicar pedidos ou liberar outra conta',async()=>{
 const works=load('lib/free-works.ts'),events=[];
 const checkout=load('app/api/checkout/free/route.ts',{'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/free-works':works,'@/lib/request-origin':origin,'@/lib/crm-events':{recordCrmEvent:async e=>events.push(e)}});
 user=null;assert.equal((await checkout.POST(request({workSlug:'memorias-de-martha'}))).status,401);
 user=account('B');assert.equal((await checkout.POST(request({workSlug:'dom-casmurro'}))).status,400);assert.equal((await checkout.POST(request({workSlug:'memorias-de-martha',userId:'A'}))).status,400);assert.equal((await checkout.POST(request({workSlug:'memorias-de-martha'},'https://evil.test'))).status,403);
 for(const work of works.freeWorks){const response=await checkout.POST(request({workSlug:work.slug}));assert.equal(response.status,200);assert.equal((await response.json()).totalCents,0);assert.equal((await checkout.POST(request({workSlug:work.slug}))).status,200);}
 assert.equal((await query('SELECT * FROM free_orders WHERE user_id=$1',['B'])).rows.length,3);
 assert.equal((await query("SELECT * FROM entitlements WHERE user_id='B' AND status='active'")).rows.length,3);
 assert.equal((await query("SELECT * FROM free_orders WHERE user_id='A'")).rows.length,0);
});
test('licença offline usa a obra escolhida, compartilha limite de aparelhos e não contorna revogação',async()=>{
 const works=load('lib/free-works.ts'),member=load('lib/member.ts',{'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/institutional-license-access':licenseAccess});
 const route=load('app/api/offline-license/route.ts',{'@/lib/member':member,'@/lib/free-works':works,'@/lib/request-origin':origin,'@/lib/transaction':{transaction:async callback=>callback({query})}});
 user=account('A');assert.equal((await route.POST(request({workSlug:'memorias-de-martha',deviceId:'fixture-111'}))).status,403);
 user=account('B');for(const slug of works.freeWorks.map(w=>w.slug))assert.equal((await route.POST(request({workSlug:slug,deviceId:'fixture-111'}))).status,200);
 assert.equal((await query("SELECT * FROM offline_licenses WHERE user_id='B'")).rows.length,3);
 assert.equal((await route.POST(request({workSlug:'memorias-de-martha',deviceId:'fixture-222'}))).status,200);
 assert.equal((await route.POST(request({workSlug:'memorias-de-martha',deviceId:'fixture-333'}))).status,409);
 await query("UPDATE member_devices SET revoked=TRUE WHERE user_id='B' AND client_device_id='fixture-111'");
 assert.equal((await route.POST(request({workSlug:'memorias-de-martha',deviceId:'fixture-333'}))).status,200);
 assert.equal((await route.POST(request({workSlug:'memorias-de-martha',deviceId:'fixture-111'}))).status,409);
});
test('download RC exige acesso da própria conta e preserva as notas somente do proprietário',async()=>{
 const member=load('lib/member.ts',{'@/lib/auth':auth,'@/lib/db':dbMock,'@/lib/institutional-license-access':licenseAccess}),offline=load('lib/rc-offline.ts');
 const route=load('app/api/works/rc/[slug]/route.ts',{'@/lib/auth':auth,'@/lib/member':member,'@/lib/rc-content':content,'@/lib/rc-schema':schema,'@/lib/db':dbMock,'@/lib/rc-offline':offline,'@/content/inferno-i-verses.json':require('../content/inferno-i-verses.json')});
 user=null;assert.equal((await route.GET(new Request('https://coonto.test'),context('memorias-de-martha'))).status,401);
 user=account('A');assert.equal((await route.GET(new Request('https://coonto.test'),context('memorias-de-martha'))).status,403);
 user=account('B');const response=await route.GET(new Request('https://coonto.test'),context('memorias-de-martha'));assert.equal(response.status,200);assert.equal(response.headers.get('X-Coonto-User'),'B');assert.equal(response.headers.get('Cache-Control'),'private, no-store');const html=await response.text();assert.ok(html.includes('rc-phone'));assert.equal(html.includes('Nota privada da conta A'),false);
});

 test('novo percurso salva as 24 interações na própria conta e recusa IDs inexistentes',async()=>{
 user=account('B');const work=await content.getRcWork('memorias-de-martha'),state=schema.prepareRcState(schema.initialRcState,work);for(const {op} of schema.rcInteractions(work))state.journey.answers[op.id]=1;state.journey.notes['cap-1-i-1']='Nota privada v2';
 let result=await progress.POST(request({state,revision:0,contentVersion:work.version}),context(work.slug));assert.equal(result.status,200);assert.equal((await result.json()).percent,100);
 const loaded=await (await progress.GET(new Request('https://coonto.test'),context(work.slug))).json();assert.equal(loaded.progress.state.journey.notes['cap-1-i-1'],'Nota privada v2');assert.equal(Object.keys(loaded.progress.state.journey.answers).length,24);
 state.journey.answers['cap-6-i-3']=2;assert.equal((await progress.POST(request({state,revision:1,contentVersion:work.version}),context(work.slug))).status,400);
 });
