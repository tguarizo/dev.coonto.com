const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={}){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:mod.exports,module:mod,require:n=>mocks[n]||require(n),process,Buffer,Response,Request,console});return mod.exports;}
const work=require('../content/rc-divina-comedia-canto-i.json'),verses=require('../content/inferno-i-verses.json');
test('leitor offline mantém sequência, retorno da escolha e notas por etapa sem oito abas',()=>{
 const {rcOfflineHtml}=load('lib/rc-offline.ts');const html=rcOfflineHtml({work,state:{unit:0,stage:0,visited:['0:0'],answers:{},notes:{}},revision:4,userId:'fixture',verses},'');
 const values=new Map(),elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:''});return elements.get(id);};const runtime={document:{getElementById:element},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{addEventListener(){},scrollTo(){}},alert(){},Audio:class{pause(){} play(){return Promise.resolve();}},console};vm.createContext(runtime);vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],runtime);
 assert.ok(element('app').innerHTML.includes('Entrar na situação'));assert.equal(element('app').innerHTML.includes('rc-stage-list'),false);
 runtime.window.go(1);assert.ok(element('app').innerHTML.includes('Versos 1–30'));assert.equal((element('app').innerHTML.match(/<li>/g)||[]).length,30);
 runtime.window.go(1);runtime.window.choose(1);assert.ok(element('app').innerHTML.includes('<strong>Descobrir</strong>'));assert.ok(element('app').innerHTML.includes(work.units[0].options[1].consequence));runtime.window.note('Minha nota privada');runtime.window.go(1);assert.ok(element('app').innerHTML.includes('O caminho do autor'));runtime.window.go(-1);assert.ok(element('app').innerHTML.includes('Minha nota privada'));
 const pending=JSON.parse(values.get('coonto-rc-pending-fixture-'+work.slug));assert.equal(pending.revision,4);assert.equal(pending.state.notes['0:2'],'Minha nota privada');assert.equal(pending.state.answers['0'],1);
 runtime.window.jump(5);runtime.window.go(1);assert.equal((element('app').innerHTML.match(/<li>/g)||[]).length,7);
});
test('HTML offline escapa conteúdo editorial antes de inserir em scripts',()=>{
 const {rcOfflineHtml}=load('lib/rc-offline.ts');const html=rcOfflineHtml({work:{...work,title:'</script><script>alert(1)</script>'},state:{unit:0,stage:0,visited:['0:0'],answers:{},notes:{}},revision:0,userId:'fixture',verses},'');assert.equal((html.match(/<script>/g)||[]).length,1);assert.ok(html.includes('\\u003c/script'));
});
test('vídeo com introdução aceita Range e recusa paths arbitrários',async()=>{
 const os=require('node:os'),path=require('node:path'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'coonto-video-'));try{fs.mkdirSync(dir+'/videos');fs.writeFileSync(dir+'/videos/depois-da-aula.mp4',Buffer.from('0123456789'));const route=load('app/api/video/[id]/route.ts',{'@/lib/work-audio':{audioDirectory:()=>dir}}),params={params:Promise.resolve({id:'depois-da-aula'})};let response=await route.GET(new Request('https://coonto.test',{headers:{Range:'bytes=2-4'}}),params);assert.equal(response.status,206);assert.equal(await response.text(),'234');assert.equal((await route.GET(new Request('https://coonto.test',{headers:{Range:'bytes=90-'}}),params)).status,416);assert.equal((await route.GET(new Request('https://coonto.test'),{params:Promise.resolve({id:'../secret'})})).status,404);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('leitor offline só serve a obra e o áudio com licença vigente; biblioteca abre sem rede',async()=>{
 const handlers={},stored=new Map();const cached={match:async key=>stored.get(typeof key==='string'?key:key.url),addAll:async()=>{},keys:async()=>[]};
 const runtime={self:{location:{origin:'https://coonto.test'},addEventListener:(type,fn)=>handlers[type]=fn},caches:{open:async()=>cached,match:async key=>stored.get(key)},fetch:async()=>{throw new Error('offline');},URL,Response,Date,Promise};vm.createContext(runtime);vm.runInContext(fs.readFileSync('public/sw.js','utf8'),runtime);
 const call=async(path,mode='navigate')=>{let pending;handlers.fetch({request:{url:'https://coonto.test'+path,method:'GET',mode},respondWith:value=>pending=value});return pending;};
 stored.set('/offline/memorias-de-martha.html',new Response('Martha salva',{headers:{'X-Coonto-Expires':new Date(Date.now()+60000).toISOString()}}));
 const shell=new Response(fs.readFileSync('public/offline/rc-reader.html','utf8'));
 // Real fetch responses keep their URL when placed into Cache Storage.
 Object.defineProperty(shell,'url',{value:'https://coonto.test/offline/rc-reader.html'});
 stored.set('/offline/rc-reader.html',shell);stored.set('/offline/library.html',new Response('Biblioteca offline'));
 assert.equal(await (await call('/offline/memorias-de-martha.html')).text(),'Martha salva');
 assert.equal(await (await call('/minha-biblioteca')).text(),'Biblioteca offline');
 const rc=await (await call('/rc/memorias-de-martha')).text();assert.ok(rc.includes('const slug="memorias-de-martha"'));
 assert.equal((await call('/offline/divina-comedia-canto-i.html')).status,503);
 stored.set('/offline/memorias-de-martha.html',new Response('expirada',{headers:{'X-Coonto-Expires':new Date(Date.now()-10000).toISOString()}}));assert.equal((await call('/offline/memorias-de-martha.html')).status,503);assert.equal((await call('/api/audio/rc/memorias-de-martha/cap-1','cors')).status,503);
});
