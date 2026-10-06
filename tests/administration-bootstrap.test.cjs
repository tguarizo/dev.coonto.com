const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
const {execFileSync}=require('node:child_process'),os=require('node:os'),path=require('node:path');
let db;
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/administration-bootstrap.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports,module:mod,require});
const {activateInitialAdministrator:activate,guardInitialAdministratorWithdrawal:withdraw}=mod.exports;
const client={query:(sql,args)=>db.query(sql,args)};
async function transaction(work){await db.exec('BEGIN');try{const r=await work();await db.exec('COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
before(async()=>{db=new PGlite();for(let round=0;round<2;round++)for(const f of fs.readdirSync('db/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('db/migrations/'+f,'utf8'));
 await db.exec("INSERT INTO users(id,email,name) VALUES('initial','master@coonto.com','Initial'),('next','next@coonto.com','Next'),('other','other@coonto.com','Other')");});
after(async()=>db.close());
test('contatos não indicados e código compartilhado não concedem administração',async()=>{
 assert.equal(await activate(client,'initial','master@coonto.com','master@coonto.com','validation'),false);
 assert.equal(await activate(client,'other','other@coonto.com','master@coonto.com','email'),false);
 assert.equal(await activate(client,'initial','master@coonto.com','','email'),false);
 assert.equal(await activate(client,'other','master@coonto.com','master@coonto.com','email'),false);
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM administration_bootstrap')).rows[0].n,0);
});
test('ativação e auditoria são únicas e fazem parte da transação do código',async()=>{
 await assert.rejects(transaction(async()=>{assert.equal(await activate(client,'initial','master@coonto.com','master@coonto.com','email'),true);throw Error('session failure');}),/session failure/);
 assert.equal((await db.query("SELECT role FROM users WHERE id='initial'")).rows[0].role,'member');
 assert.equal(await transaction(()=>activate(client,'initial','master@coonto.com','master@coonto.com','email')),true);
 assert.equal(await transaction(()=>activate(client,'initial','master@coonto.com','master@coonto.com','email')),false);
 assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM crm_events WHERE event_type='administration_bootstrap_activated'")).rows[0].n,1);
});
test('não retira a conta inicial antes de outro administrador ter sessão válida',async()=>{
 await db.exec("UPDATE users SET role='admin' WHERE id='next'");
 await assert.rejects(transaction(()=>withdraw(client,'initial','next')),/outro administrador/);
 await db.exec("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES('expired','next',NOW()-INTERVAL '1 minute')");
 await assert.rejects(transaction(()=>withdraw(client,'initial','next')),/outro administrador/);
 await db.exec("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES('valid','next',NOW()+INTERVAL '1 day')");
 await transaction(async()=>{await withdraw(client,'initial','next');await db.exec("UPDATE users SET role='member' WHERE id='initial'");});
 assert.equal((await db.query('SELECT retired_by FROM administration_bootstrap')).rows[0].retired_by,'next');
});
test('retirada preserva recibo e não promove novamente no login',async()=>{
 assert.equal(await transaction(()=>activate(client,'initial','master@coonto.com','master@coonto.com','email')),false);
 assert.equal((await db.query("SELECT role FROM users WHERE id='initial'")).rows[0].role,'member');
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM administration_bootstrap')).rows[0].n,1);
});
test('configuração privada é idempotente e preserva desativação explícita',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coonto-bootstrap-'));
 const script=path.resolve('scripts/configure-bootstrap.py'),file=path.join(dir,'.env');
 try{
  fs.writeFileSync(file,'AUTH_MODE=email\nUNRELATED=value\n');
  execFileSync('python3',[script],{cwd:dir});
  const configured=fs.readFileSync(file,'utf8');assert.match(configured,/COONTO_BOOTSTRAP_MASTER_EMAIL=master@coonto.com/);assert.match(configured,/UNRELATED=value/);
  execFileSync('python3',[script],{cwd:dir});assert.equal(fs.readFileSync(file,'utf8'),configured);
  fs.writeFileSync(file,'COONTO_BOOTSTRAP_MASTER_EMAIL=\n');execFileSync('python3',[script],{cwd:dir});assert.equal(fs.readFileSync(file,'utf8'),'COONTO_BOOTSTRAP_MASTER_EMAIL=\n');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
