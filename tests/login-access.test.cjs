const {test}=require('node:test');const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
function load(file,mocks={}){const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(source,{exports:mod.exports,module:mod,require:name=>mocks[name]||require(name),process,Buffer,console});return mod.exports;}
const {loginContact,safeReturnTo}=load('lib/login-contact.ts');
const {currentLoginArt}=load('lib/login-art.ts');
test('normaliza os contatos e separa códigos de email e SMS',()=>{
 assert.equal(loginContact({email:' Person@Example.test '}).key,'person@example.test');
 assert.equal(loginContact({channel:'sms',phone:'(11) 99999-9999'}).key,'sms:5511999999999');
 for(const body of [{email:'bad'},{channel:'sms',phone:'invalid'},{channel:'fax',email:'a@b.test'}])assert.equal(loginContact(body),null);
});
test('bloqueia redirecionamentos externos e barras invertidas',()=>{
 for(const value of ['https://bad.test','//bad.test','/\\bad.test','/\n/bad.test'])assert.equal(safeReturnTo(value),'/minha-biblioteca');
 assert.equal(safeReturnTo('/checkout/o-alienista?return_to=%2F'),' /checkout/o-alienista?return_to=%2F'.trim());
});
test('troca a imagem somente ao completar dois dias e repete o ciclo',()=>{
 assert.equal(currentLoginArt(new Date('2026-09-30T00:00:00-03:00')),'phase1');
 assert.equal(currentLoginArt(new Date('2026-10-01T23:59:59-03:00')),'phase1');
 assert.equal(currentLoginArt(new Date('2026-10-02T00:00:00-03:00')),'phase2');
 assert.equal(currentLoginArt(new Date('2026-10-10T00:00:00-03:00')),'phase1');
});
test('código correto não é consumido enquanto o primeiro acesso aguarda nome',async()=>{
 const commands=[],client={query:async(sql)=>{commands.push(sql);return {rows:sql.startsWith('SELECT id,code_hash')?[{id:'id',code_hash:'ab'.repeat(32),attempts:0}]:[]};}};
 const {consumeLoginCode}=load('lib/login-code.ts',{'@/lib/transaction':{transaction:callback=>callback(client)}});
 const result=await consumeLoginCode('email','ab'.repeat(32),async()=>false);
 assert.equal(result.needsName,true);assert.equal(commands.some(sql=>sql.startsWith('UPDATE')),false);
});
test('autenticação confirmada consome todas as versões pendentes do contato',async()=>{
 let consumed=false,registered=false;
 const client={query:async sql=>{if(sql.startsWith('UPDATE login_codes'))consumed=true;return {rows:sql.startsWith('SELECT id,code_hash')?[{id:'id',code_hash:'ab'.repeat(32),attempts:0}]:[]};}};
 const {consumeLoginCode}=load('lib/login-code.ts',{'@/lib/transaction':{transaction:callback=>callback(client)}});
 const result=await consumeLoginCode('sms:5511999999999','ab'.repeat(32),async()=>{registered=true;return true;});
 assert.equal(result.ok,true);assert.equal(consumed,true);assert.equal(registered,true);
});
