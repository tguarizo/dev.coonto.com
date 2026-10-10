const test=require('node:test'),assert=require('node:assert/strict');
const {checkBudget}=require('../scripts/audio-budget.cjs');
test('audio budget blocks overage and preserves reserve',()=>{
 assert.throws(()=>checkBudget({character_count:1000,character_limit:2000},501,'eleven_multilingual_v2'),/insuficientes/);
 assert.equal(checkBudget({character_count:1000,character_limit:2000},500,'eleven_multilingual_v2').remaining,1000);
});
test('unknown credit balance or model never authorizes generation',()=>{
 assert.throws(()=>checkBudget({},1,'eleven_multilingual_v2'),/inválido/);
 assert.throws(()=>checkBudget({character_count:0,character_limit:10000},1,'unknown'),/Modelo/);
});
