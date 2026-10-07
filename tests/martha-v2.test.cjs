const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports:mod.exports,module:mod,require,process});return mod.exports;}
const schema=load('lib/rc-schema.ts'),work=schema.rcWorkSchema.parse(require('../content/rc-memorias-de-martha.json')),entries=schema.rcInteractions(work),audio=require('../scripts/rc-audio.cjs');
test('Martha completa: 12 capítulos, 24 decisões e 72 retornos com referências auditadas',()=>{
 assert.equal(work.units.length,12);assert.equal(entries.length,24);assert.equal(entries.reduce((n,{op})=>n+op.options.length,0),72);
 assert.deepEqual(Array.from(work.units,u=>[u.sourceStart,u.sourceEnd]),[[9,25],[27,40],[41,53],[55,70],[71,82],[83,97],[99,116],[117,129],[131,144],[145,150],[151,160],[161,166]]);
 assert.ok(entries[1].op.sourcePages.includes(27));assert.equal(work.units[5].interactions.length,1);assert.equal(work.units[8].interactions.length,3);
 const invalid=structuredClone(work);invalid.units[0].interactions[1].id=invalid.units[0].interactions[0].id;assert.equal(schema.rcWorkSchema.safeParse(invalid).success,false);
});
test('migração preserva notas e escolhas antigas sem responder às novas perguntas',()=>{
 const old={unit:8,stage:6,visited:['0:0','8:6'],answers:{8:2},notes:{'8:6':'Minha nota anterior'}};const state=schema.prepareRcState(old,work);
 assert.equal(state.unit,8);assert.equal(state.journey.index,15);assert.equal(state.answers[8],2);assert.equal(state.notes['8:6'],'Minha nota anterior');assert.equal(Object.keys(state.journey.answers).length,0);assert.equal(schema.rcProgress(state,work),0);assert.equal(schema.validRcState(state,work),true);
 state.journey.answers['cap-9-i-1']=1;assert.equal(schema.rcProgress(state,work),4);state.journey.answers['cap-6-i-3']=1;assert.equal(schema.validRcState(state,work),false);
});
test('posição e respostas novas são validadas contra a obra, incluindo índice e turma de capítulo',()=>{
 const state=schema.prepareRcState(schema.initialRcState,work);state.journey.index=24;assert.equal(schema.validRcState(state,work),false);state.journey.index=2;assert.equal(schema.validRcState(state,work),false);state.unit=1;assert.equal(schema.validRcState(state,work),true);
 const dante=schema.rcWorkSchema.parse(require('../content/rc-divina-comedia-canto-i.json'));assert.equal(schema.validRcState(state,dante),false);
});
function offline(state=schema.prepareRcState(schema.initialRcState,work)){
 const html=load('lib/rc-offline.ts').rcOfflineHtml({work,state,revision:4,userId:'fixture',verses:[]},'');const values=new Map(),elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:''});return elements.get(id);};const runtime={document:{getElementById:element},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{addEventListener(){},scrollTo(){}},alert(){},Audio:class{pause(){}play(){return Promise.resolve();}},console,Set};vm.createContext(runtime);vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],runtime);return {runtime,values,element};
}
test('offline percorre todas as interações, preserva notas ao voltar e só revela depois da escolha',()=>{
 const {runtime,element,values}=offline();for(let i=0;i<entries.length;i++){
  const op=entries[i].op;assert.ok(element('app').innerHTML.includes(op.title));if(op.reveal)assert.equal(element('app').innerHTML.includes(op.reveal),false);
  for(let answer=0;answer<3;answer++){runtime.window.choose(answer);assert.ok(element('app').innerHTML.includes(op.options[answer].consequence));if(op.reveal)assert.ok(element('app').innerHTML.includes(op.reveal));}
  runtime.window.note('nota '+i);if(i) {runtime.window.go(-1);assert.ok(element('app').innerHTML.includes('nota '+(i-1)));runtime.window.go(1);}runtime.window.go(1);
 }
 const pending=JSON.parse(values.get('coonto-rc-pending-fixture-'+work.slug));assert.equal(pending.revision,4);assert.equal(Object.keys(pending.state.journey.answers).length,24);assert.equal(Object.keys(pending.state.journey.notes).length,24);assert.equal(pending.state.journey.index,0);assert.equal(schema.rcProgress(pending.state,work),100);
 for(let u=0;u<12;u++){runtime.window.jump(u);const p=JSON.parse(values.get('coonto-rc-pending-fixture-'+work.slug));assert.equal(p.state.unit,u);assert.equal(entries[p.state.journey.index].unit,u);}
});
test('locução de preparação não contém as revelações; cada escolha tem seu próprio retorno',()=>{
 const media=audio.rcAudioEntries(work);assert.equal(media.length,108);for(const {op} of entries){const prep=media.find(m=>m.id===op.id+'-pre');assert.ok(prep.text.includes(op.preparation));if(op.reveal)assert.equal(prep.text.includes(op.reveal),false);for(let i=0;i<3;i++){const returned=media.find(m=>m.id===op.id+'-r-'+i);assert.ok(returned.text.includes(op.options[i].consequence));if(op.reveal)assert.ok(returned.text.includes(op.reveal));}}
});
