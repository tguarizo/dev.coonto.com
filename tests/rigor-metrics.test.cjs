const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('content/Coonto_O_Alienista.html','utf8'),screens=JSON.parse(html.match(/const SCREENS = (\[[^\n]*\]);/)[1]);
function runtime(state){const context={SCREENS:screens,state,save(){},IMG:{final:''}};vm.createContext(context);for(const name of ['pct','needsAnswer','scores','percent','finalView'])vm.runInContext(name==='finalView'?html.slice(html.indexOf('function finalView('),html.indexOf('\nfunction render(')):html.match(new RegExp('function '+name+'\\([^\\n]*'))[0],context);return context;}
test('uma resposta entre 35 não vira 100% de compreensão nem cinco fases concluídas',()=>{
 const q=screens.find(x=>x.type==='choice'),state={idx:screens.length-1,answers:{[q.id]:q.best},notes:{},visits:{[q.id]:1,final:1}};const r=runtime(state),view=r.finalView(screens.at(-1));
 assert.ok(view.includes('1 / 35'));assert.ok(view.includes('0 / 5'));assert.ok(view.includes('1 / 1 respondidas'));assert.equal(view.includes('Compreensão exercitada'),false);assert.equal(view.includes('100%'),false);assert.ok(r.pct()<10);
});
test('chegar ao fim sem responder registra zero respostas sem alegar aprendizagem',()=>{
 const r=runtime({idx:screens.length-1,answers:{},notes:{},visits:{final:1}});const view=r.finalView(screens.at(-1));assert.ok(view.includes('0 / 35'));assert.ok(view.includes('0 / 0 respondidas'));assert.ok(view.includes('não mede compreensão'));assert.equal(r.pct(),2);
});
test('progresso usa visitas únicas, independentemente de saltos e repetições',()=>{
 const r=runtime({idx:0,answers:{},notes:{},visits:Object.fromEntries(screens.map(s=>[s.id,4]))});assert.equal(r.pct(),100);assert.ok(r.finalView(screens.at(-1)).includes('5 / 5'));
});
