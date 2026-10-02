// --generate consome créditos; sem a opção, apenas prévia. Falhas não são repetidas automaticamente.
import {readFile,writeFile,mkdir,rename,copyFile,rm,access} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import pg from 'pg';
const generate=process.argv.includes('--generate'),retry=process.argv.includes('--retry');
const output=path.resolve(process.env.COONTO_AUDIO_DIR||'audio');
const model=process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2';
const narrator=process.env.ELEVENLABS_COONTO_VOICE_ID||'czvzJwIVS2asEKnthV40';
const voice=s=>s==='narrator'?narrator:s==='previous-narrator'?process.env.ELEVENLABS_NARRATOR_VOICE_ID:process.env.ELEVENLABS_BACAMARTE_VOICE_ID;
const load=async name=>JSON.parse(await readFile('content/'+name+'.json','utf8'));
const manifestPath=path.join(output,'beta-audio-manifest.json');let manifest={items:{},attempts:[]};try{manifest=JSON.parse(await readFile(manifestPath,'utf8'));}catch{}
const items=[];
for(const item of await load('home-example-audio'))items.push({key:'home-examples/'+item.id,segments:[{speaker:item.speaker||'narrator',text:item.text}]});
for(const slug of ['memorias-de-martha','divina-comedia-canto-i']){
 let work=await load('rc-'+slug);
 if(process.env.DATABASE_URL){const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});try{const result=await pool.query("SELECT content FROM rc_content_versions WHERE work_slug=$1 AND status='published'",[slug]);if(result.rows[0])work=result.rows[0].content;}finally{await pool.end();}}
 for(const unit of work.units)items.push({key:slug+'/'+unit.id,segments:[{speaker:'narrator',text:unit.title+'. '+unit.context}]});
}
let workAudio=await load('o-alienista-audio');
if(process.env.DATABASE_URL){const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});try{const result=await pool.query("SELECT scene_id,segments FROM coonto_audio_jobs WHERE work_slug='o-alienista' AND status='published'");const published=new Map(result.rows.map(r=>[r.scene_id,r.segments]));workAudio=workAudio.map(s=>({...s,segments:published.get(s.id)||s.segments}));}finally{await pool.end();}}
for(const item of workAudio)items.push({key:'o-alienista/'+item.id,segments:item.segments.map(s=>({speaker:s.speaker,text:s.text}))});
for(const item of items){item.segments=item.segments.map(s=>({...s,voiceId:voice(s.speaker)}));item.hash=createHash('sha256').update(JSON.stringify({model,segments:item.segments})).digest('hex');item.characters=item.segments.reduce((sum,s)=>sum+s.text.length,0);}
const selectedWork=process.argv.find(arg=>arg.startsWith('--work='))?.slice(7);if(selectedWork&&!['home-examples','o-alienista','memorias-de-martha','divina-comedia-canto-i'].includes(selectedWork))throw new Error('Obra inválida.');
const pending=[];for(const item of items.filter(item=>!selectedWork||item.key.startsWith(selectedWork+'/'))){let exists=false;try{await access(path.join(output,item.key+'.mp3'));exists=true;}catch{}if(manifest.items[item.key]?.hash===item.hash&&manifest.items[item.key]?.status==='ready'&&exists)continue;pending.push(item);}
console.log(`Áudio beta: ${pending.length} arquivos a atualizar, ${pending.reduce((n,i)=>n+i.characters,0)} caracteres. Voz Coonto: ${narrator}.`);
if(!generate)process.exit(0);
if(!pending.length)process.exit(0);
if(pending.some(i=>i.segments.some(s=>s.speaker==='previous-narrator'))){if(voice('previous-narrator')===narrator)throw new Error('A voz original e a voz Coonto precisam ser distintas.');console.log('Voz original dos títulos e situações: '+voice('previous-narrator'));}
if(!process.env.ELEVENLABS_API_KEY||pending.some(i=>i.segments.some(s=>!s.voiceId)))throw new Error('Chave ou voz ausente; nenhuma geração iniciada.');
if(pending.some(i=>i.segments.length>1)&&spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status!==0)throw new Error('ffmpeg indisponível; nenhuma geração iniciada.');
await mkdir(output,{recursive:true});
async function saveManifest(){const temporary=manifestPath+'.tmp';await writeFile(temporary,JSON.stringify(manifest,null,2));await rename(temporary,manifestPath);}
const pool=process.env.DATABASE_URL?new pg.Pool({connectionString:process.env.DATABASE_URL}):null;
const client=pool?await pool.connect():null;let locked=false;
try{
 if(client){locked=(await client.query('SELECT pg_try_advisory_lock(180010) AS locked')).rows[0].locked;if(!locked)throw new Error('Outra produção está em andamento.');}
 const since=Date.now()-86400000;
 let used=manifest.attempts.filter(a=>a.at>since).reduce((n,a)=>n+a.characters,0);
 if(client)used+=Number((await client.query("SELECT COALESCE(SUM(requested_characters),0) AS total FROM coonto_audio_jobs WHERE created_at>NOW()-INTERVAL '24 hours'")).rows[0].total);
 const limit=Math.max(5000,Math.min(100000,Number(process.env.COONTO_AUDIO_DAILY_CHAR_LIMIT)||25000));
 for(const item of pending){
  if(!retry&&manifest.attempts.some(a=>a.key===item.key&&a.hash===item.hash)&&manifest.items[item.key]?.hash!==item.hash)throw new Error('Tentativa anterior incompleta para '+item.key+'. Revise o fornecedor antes de usar --retry.');
  if(used+item.characters>limit)throw new Error(`Limite diário de ${limit} caracteres alcançado; restante preservado.`);
  const temporary=path.join(output,'drafts','beta-'+randomUUID());await mkdir(temporary,{recursive:true});const pieces=[];
  try{
   for(let index=0;index<item.segments.length;index++){
    const segment=item.segments[index];manifest.attempts.push({key:item.key,hash:item.hash,characters:segment.text.length,at:Date.now()});used+=segment.text.length;await saveManifest();
    const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(segment.voiceId)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:segment.text,model_id:model,language_code:'pt',voice_settings:{stability:.5,similarity_boost:.75}}),signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('ElevenLabs respondeu '+response.status+' para '+item.key+'; sem repetição automática.');
    const buffer=Buffer.from(await response.arrayBuffer());if(!response.headers.get('content-type')?.includes('audio')||!buffer.length||buffer.length>30*1024*1024)throw new Error('Arquivo inválido para '+item.key);
    const piece=path.join(temporary,index+'.mp3');await writeFile(piece,buffer);pieces.push(piece);
   }
   const combined=path.join(temporary,'ready.mp3');
   if(pieces.length===1)await rename(pieces[0],combined);
   else{const list=path.join(temporary,'list.txt');await writeFile(list,pieces.map(p=>`file '${p}'`).join('\n'));const process=spawnSync('ffmpeg',['-y','-f','concat','-safe','0','-i',list,'-c:a','libmp3lame',combined],{stdio:'ignore',timeout:30000});if(process.status!==0)throw new Error('Falha na combinação de '+item.key);}
   const target=path.join(output,item.key+'.mp3'),history=path.join(output,'versions',item.key);await mkdir(path.dirname(target),{recursive:true});await mkdir(history,{recursive:true});
   try{await copyFile(target,path.join(history,manifest.items[item.key]?.hash||'pre-beta2')+'.mp3');}catch(error){if(error.code!=='ENOENT')throw error;}
   await copyFile(combined,path.join(history,item.hash+'.mp3'));await rename(combined,target);
   let jobId=null;
   if(client&&!item.key.startsWith('home-examples/')){jobId=randomUUID();await copyFile(target,path.join(output,'drafts',jobId+'.mp3'));const [workSlug,sceneId]=item.key.split('/');await client.query('BEGIN');try{await client.query("UPDATE coonto_audio_jobs SET status='ready',updated_at=NOW() WHERE work_slug=$1 AND scene_id=$2 AND status='published'",[workSlug,sceneId]);await client.query("INSERT INTO coonto_audio_jobs(id,work_slug,scene_id,segments,model,characters,status,generation_source) VALUES($1,$2,$3,$4::jsonb,$5,$6,'published','beta-script')",[jobId,workSlug,sceneId,JSON.stringify(item.segments),model,item.characters]);await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}}
   manifest.items[item.key]={jobId,hash:item.hash,status:'ready',model,segments:item.segments.map(s=>({speaker:s.speaker,voiceId:s.voiceId})),characters:item.characters,generatedAt:new Date().toISOString()};await saveManifest();console.log(item.key+': atualizado e versionado.');
  }finally{await rm(temporary,{recursive:true,force:true});}
 }
 console.log('Áudios beta concluídos.');
}finally{if(locked)await client.query('SELECT pg_advisory_unlock(180010)');client?.release();await pool?.end();}
