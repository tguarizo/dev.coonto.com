const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('migrações de áudio aceitam Dante e Martha e podem ser repetidas com registros publicados',async()=>{
 const db=await PGlite.create();try{
  const files=fs.readdirSync('db/migrations').filter(f=>f.endsWith('.sql')).sort();
  for(const f of files)await db.exec(fs.readFileSync('db/migrations/'+f,'utf8'));
  for(const [work,id] of [['memorias-de-martha','cap-12-i-3-r-2'],['divina-comedia-canto-i','mov-6-i-2-pre'],['o-alienista','s0']])await db.query("INSERT INTO coonto_audio_jobs(id,work_slug,scene_id,segments,model,characters,status) VALUES($2,$1,$2,'[]'::jsonb,'test',1,'published')",[work,id]);
  for(const f of files)await db.exec(fs.readFileSync('db/migrations/'+f,'utf8'));
  assert.equal((await db.query('SELECT count(*) FROM coonto_audio_jobs')).rows[0].count,3);
  await assert.rejects(db.query("INSERT INTO coonto_audio_jobs(id,work_slug,scene_id,segments,model,characters) VALUES('bad','divina-comedia-canto-i','cap-1-i-1-pre','[]'::jsonb,'test',1)"));
 }finally{await db.close();}
});
