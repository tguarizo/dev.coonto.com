const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
test('home publica quatro trechos por obra com duas vozes e não regenera arquivos prontos',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coonto-home-audio-'));
 try{
  const mock=path.join(dir,'provider.mjs'),ledger=path.join(dir,'requests.jsonl');
  fs.writeFileSync(mock,`import {appendFile} from 'node:fs/promises';\nglobalThis.fetch=async(url,options)=>{await appendFile(process.env.TEST_AUDIO_LEDGER,JSON.stringify({url,text:JSON.parse(options.body).text})+'\\n');return new Response(new Uint8Array([73,68,51]),{headers:{'Content-Type':'audio/mpeg'}});};`);
  const env={...process.env,COONTO_AUDIO_DIR:dir,ELEVENLABS_API_KEY:'fixture',ELEVENLABS_COONTO_VOICE_ID:'new-voice',ELEVENLABS_NARRATOR_VOICE_ID:'previous-voice',TEST_AUDIO_LEDGER:ledger};delete env.DATABASE_URL;
  const run=()=>spawnSync(process.execPath,['--import',mock,'scripts/generate-beta-audio.mjs','--generate','--work=home-examples'],{env,encoding:'utf8'});
  const first=run();assert.equal(first.status,0,first.stderr);
  const items=require('../content/home-example-audio.json');assert.equal(items.length,12);
  const calls=fs.readFileSync(ledger,'utf8').trim().split('\n').map(JSON.parse);
  for(const work of ['alienista','dom-casmurro','divina-comedia'])for(const section of ['title','opening','situation','comment']){
   const item=items.find(i=>i.id===work+'-'+section);assert.ok(item);
   const call=calls.find(c=>c.text===item.text);assert.ok(call);
   const voice=['title','situation'].includes(section)?'previous-voice':'new-voice';assert.ok(call.url.includes('/'+voice+'?'));
   assert.ok(fs.existsSync(path.join(dir,'home-examples',item.id+'.mp3')));
  }
  const second=run();assert.equal(second.status,0,second.stderr);assert.match(second.stdout,/0 arquivos a atualizar/);
  assert.equal(fs.readFileSync(ledger,'utf8').trim().split('\n').length,12);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
