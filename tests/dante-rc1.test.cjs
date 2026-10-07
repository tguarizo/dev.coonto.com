const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports:mod.exports,module:mod,require,process});return mod.exports;}
const schema=load('lib/rc-schema.ts'),work=schema.rcWorkSchema.parse(require('../content/rc-divina-comedia-canto-i.json')),entries=schema.rcInteractions(work),verses=require('../content/inferno-i-verses.json');
test('Dante cobre 136 versos sem lacunas, 14 interações e preserva os 42 retornos da curadoria',()=>{
 const proposal=require('../deploy/curadoria/dante-canto-i-v1/proposta-editorial.json');assert.equal(entries.length,14);let next=1;
 work.units.forEach(u=>{assert.equal(u.sourceStart,next);next=u.sourceEnd+1;});assert.equal(next,137);assert.equal(work.units[2].sourceEnd,87);assert.equal(work.units[3].sourceStart,88);
 entries.forEach(({op},i)=>{assert.equal(op.preparation,proposal.interactions[i].before);assert.equal(op.question,proposal.interactions[i].q);assert.deepEqual(Array.from(op.options,o=>o.consequence),proposal.interactions[i].feedback);assert.ok(op.sourceRanges.every(r=>r.start<=r.end&&verses.slice(r.start-1,r.end).length===r.end-r.start+1));});
 const wrong=structuredClone(work);wrong.units[0].interactions[0].id='cap-1-i-1';assert.equal(schema.rcWorkSchema.safeParse(wrong).success,false);
 const refs=structuredClone(work);refs.units[0].interactions[0].sourceRanges=[{start:10,end:2}];assert.equal(schema.rcWorkSchema.safeParse(refs).success,false);
});
test('Dante retoma o movimento antigo preservando notas, sem responder às novas perguntas nem aceitar IDs de Martha',()=>{
 const state=schema.prepareRcState({unit:3,stage:5,visited:['3:5'],answers:{3:2},notes:{'3:5':'nota anterior'}},work);
 assert.equal(entries[state.journey.index].unit,3);assert.equal(state.answers[3],2);assert.equal(state.notes['3:5'],'nota anterior');assert.equal(schema.rcProgress(state,work),0);assert.ok(schema.validRcState(state,work));state.journey.answers['cap-1-i-1']=0;assert.equal(schema.validRcState(state,work),false);
});
test('Dante offline mostra os versos antes da decisão, percorre 42 retornos e mantém notas e movimentos',()=>{
 const html=load('lib/rc-offline.ts').rcOfflineHtml({work,state:schema.prepareRcState(schema.initialRcState,work),revision:7,userId:'fictional',verses},'');const values=new Map(),els=new Map(),element=id=>{if(!els.has(id))els.set(id,{innerHTML:'',textContent:''});return els.get(id);};const runtime={document:{getElementById:element},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{addEventListener(){},scrollTo(){}},alert(){},Audio:class{pause(){}play(){return Promise.resolve();}},console,Set};vm.createContext(runtime);vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],runtime);
 for(let i=0;i<entries.length;i++){const {op,unit}=entries[i];let rendered=element('app').innerHTML;assert.ok(rendered.includes('Movimento '+(unit+1)+'/6'));assert.ok(rendered.includes('Texto de apoio'));assert.equal((rendered.match(/<li>/g)||[]).length,op.sourceRanges.reduce((n,r)=>n+r.end-r.start+1,0));for(let a=0;a<3;a++){runtime.window.choose(a);assert.ok(element('app').innerHTML.includes(op.options[a].consequence));}runtime.window.note('nota '+i);if(i){runtime.window.go(-1);assert.ok(element('app').innerHTML.includes('nota '+(i-1)));runtime.window.go(1);}runtime.window.go(1);}
 const pending=JSON.parse(values.get('coonto-rc-pending-fictional-'+work.slug));assert.equal(Object.keys(pending.state.journey.answers).length,14);assert.equal(Object.keys(pending.state.journey.notes).length,14);assert.equal(schema.rcProgress(pending.state,work),100);assert.ok(schema.validRcState(pending.state,work));
 for(let u=0;u<6;u++){runtime.window.jump(u);assert.ok(element('app').innerHTML.includes('Movimento '+(u+1)+'/6'));}
});
test('Dante áudio contém preparação e retorno separado de cada alternativa',()=>{
 const media=require('../scripts/rc-audio.cjs').rcAudioEntries(work);assert.equal(media.length,62);entries.forEach(({op})=>{assert.ok(media.find(m=>m.id===op.id+'-pre').text.includes(op.question));for(let a=0;a<3;a++){const text=media.find(m=>m.id===op.id+'-r-'+a).text;assert.ok(text.includes(op.options[a].consequence));assert.ok(text.includes(op.discovery));}});
});
