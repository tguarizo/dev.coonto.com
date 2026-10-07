const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('áudio concluído antes de falha no banco é retomado sem repetir chamada TTS',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coonto-audio-recovery-'));
 try{
  const sample=path.join(dir,'sample.mp3');assert.equal(spawnSync('ffmpeg',['-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t','0.1',sample],{stdio:'ignore'}).status,0);
  const loader=path.join(dir,'mock.cjs'),calls=path.join(dir,'calls');
  fs.writeFileSync(loader,`const fs=require('node:fs'),pg=require(${JSON.stringify(path.resolve('node_modules/pg'))});pg.Pool=class{async connect(){return this}async end(){}release(){}async query(sql){if(sql.includes('rc_content_versions'))return {rows:sql.includes('WHERE')&&arguments[1][0]==='divina-comedia-canto-i'?[{content:{units:[{id:'mov-1-i-1-pre',title:'Teste',context:'Uma situação',interactions:[]}]}}]:[]};if(sql.includes('pg_try_advisory'))return {rows:[{locked:true}]};if(sql.includes('SUM('))return {rows:[{total:0}]};if(sql.includes('INSERT INTO')&&process.env.FAIL_DB==='1')throw Error('simulated constraint failure');return {rows:[]};}};global.fetch=async()=>{fs.appendFileSync(${JSON.stringify(calls)},'call\\n');return new Response(fs.readFileSync(${JSON.stringify(sample)}),{headers:{'Content-Type':'audio/mpeg'}});};`);
  const run=fail=>spawnSync(process.execPath,['--require',loader,'scripts/generate-beta-audio.mjs','--generate','--work=divina-comedia-canto-i'],{encoding:'utf8',env:{...process.env,DATABASE_URL:'mock',ELEVENLABS_API_KEY:'fake-test-key',COONTO_AUDIO_DIR:path.join(dir,'audio'),FAIL_DB:fail?'1':'0'}});
  const first=run(true);assert.notEqual(first.status,0);assert.ok(first.stderr.includes('simulated constraint failure'),first.stderr);assert.equal(fs.readFileSync(calls,'utf8').trim().split('\n').length,1);
  const second=run(false);assert.equal(second.status,0,second.stderr);assert.ok(second.stdout.includes('sem nova chamada'));assert.equal(fs.readFileSync(calls,'utf8').trim().split('\n').length,1);
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'audio/beta-audio-manifest.json'),'utf8'));assert.equal(manifest.items['divina-comedia-canto-i/mov-1-i-1-pre'].status,'ready');assert.equal(manifest.items['divina-comedia-canto-i/mov-1-i-1-pre'].recoveredFromVersion,true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
