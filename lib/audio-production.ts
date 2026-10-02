import {access,constants,mkdir,readFile,writeFile,rename,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {getRcWork} from '@/lib/rc-content';
import {z} from 'zod';
import {getPool,query} from '@/lib/db';
import {audioDirectory} from '@/lib/work-audio';
import {recordCrmEvent} from '@/lib/crm-events';

export const audioInput=z.object({workSlug:z.enum(['o-alienista','memorias-de-martha','divina-comedia-canto-i']).default('o-alienista'),sceneId:z.string().regex(/^(?:s(?:[0-9]|[1-3][0-9]|4[0-2])|c[1-4]|final|cap-(?:[1-9]|1[0-2])|mov-[1-6])$/),segments:z.array(z.object({speaker:z.enum(['narrator','bacamarte']),text:z.string().trim().min(1).max(5000)})).min(1).max(2)}).refine(x=>x.segments.reduce((n,s)=>n+s.text.length,0)<=5000).refine(x=>x.workSlug==='o-alienista'?/^(?:s(?:[0-9]|[1-3][0-9]|4[0-2])|c[1-4]|final)$/.test(x.sceneId):x.workSlug==='memorias-de-martha'?/^cap-/.test(x.sceneId):/^mov-/.test(x.sceneId));
export type AudioInput=z.infer<typeof audioInput>;
export type AudioJob={id:string;work_slug:string;scene_id:string;segments:(AudioInput['segments'][number]&{voiceId?:string})[];model:string;characters:number;requested_characters:number;status:string;error_message:string;created_at:string;updated_at:string};
export class AudioError extends Error {}
export function voiceId(speaker:'narrator'|'bacamarte') {return speaker==='narrator'?(process.env.ELEVENLABS_COONTO_VOICE_ID||'czvzJwIVS2asEKnthV40'):process.env.ELEVENLABS_BACAMARTE_VOICE_ID;}
export function draftPath(id:string){if(!z.string().uuid().safeParse(id).success)throw new AudioError('Áudio inválido.');return path.join(audioDirectory(),'drafts',id+'.mp3');}
export async function audioWritable(){try{await mkdir(audioDirectory(),{recursive:true});await access(audioDirectory(),constants.W_OK);return true;}catch{return false;}}
function ffmpeg(args:string[]){return new Promise<void>((resolve,reject)=>{const process=spawn('ffmpeg',args,{stdio:'ignore'});const timer=setTimeout(()=>process.kill('SIGKILL'),30000);process.once('error',()=>{clearTimeout(timer);reject(new AudioError('Não foi possível combinar as vozes.'));});process.once('close',code=>{clearTimeout(timer);code===0?resolve():reject(new AudioError('Não foi possível combinar as vozes.'));});});}

// A conexão mantém o bloqueio durante a chamada externa; nenhuma repetição automática consome créditos.
export async function produceAudio(input:AudioInput,actor:string){
 if(input.workSlug!=='o-alienista'){const work=await getRcWork(input.workSlug);const unit=work.units.find(u=>u.id===input.sceneId);if(!unit||input.segments.length!==1||input.segments[0].speaker!=='narrator'||input.segments[0].text!==unit.title+'. '+unit.context)throw new AudioError('Para o Beta RC, publique primeiro a abertura no editor de conteúdo. O áudio deve corresponder à abertura atual.');}
 const key=process.env.ELEVENLABS_API_KEY;
 if(!key||input.segments.some(s=>!voiceId(s.speaker)))throw new AudioError('A chave ou a voz escolhida ainda não está configurada no aplicativo.');
 if(!await audioWritable())throw new AudioError('A pasta de áudio não está disponível para gravação.');
 const client=await getPool().connect();let locked=false;let jobId='';let temporary='';
 try{
  const lock=await client.query<{locked:boolean}>('SELECT pg_try_advisory_lock(180010) AS locked');locked=lock.rows[0].locked;
  if(!locked)throw new AudioError('Há uma geração em andamento. Aguarde e tente novamente.');
  const chars=input.segments.reduce((n,s)=>n+s.text.length,0);
  const betaUsage=await betaAudioUsage(1);
  const daily=await client.query<{total:string}>("SELECT COALESCE(SUM(characters),0)::text AS total FROM coonto_audio_jobs WHERE created_at>NOW()-INTERVAL '24 hours' AND generation_source='crm'");
  const limit=Math.max(5000,Math.min(100000,Number(process.env.COONTO_AUDIO_DAILY_CHAR_LIMIT)||25000));
  if(Number(daily.rows[0].total)+betaUsage+chars>limit)throw new AudioError(`Limite de ${limit.toLocaleString('pt-BR')} caracteres em 24 horas atingido. As audições e aprovações continuam disponíveis.`);
  const model=process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2';jobId=crypto.randomUUID();
  const segments=input.segments.map(s=>({...s,voiceId:voiceId(s.speaker)}));
  await client.query('INSERT INTO coonto_audio_jobs(id,scene_id,segments,model,characters,created_by,work_slug) VALUES($1,$2,$3::jsonb,$4,$5,$6,$7)',[jobId,input.sceneId,JSON.stringify(segments),model,chars,actor,input.workSlug]);
  temporary=path.join(audioDirectory(),'drafts',jobId);await mkdir(temporary,{recursive:true});
  const pieces:string[]=[];
  for(let i=0;i<segments.length;i++){
   const segment=segments[i];
   await client.query('UPDATE coonto_audio_jobs SET requested_characters=requested_characters+$2,updated_at=NOW() WHERE id=$1',[jobId,segment.text.length]);
   const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(segment.voiceId!)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({text:segment.text,model_id:model,voice_settings:{stability:0.5,similarity_boost:0.75}}),signal:AbortSignal.timeout(60000)});
   if(!response.ok)throw new AudioError(response.status===401||response.status===403?'ElevenLabs recusou o acesso. Confira as permissões da chave e da voz.':response.status===429?'ElevenLabs informou limite de uso. Confira o saldo e tente mais tarde.':`ElevenLabs não gerou o áudio (resposta ${response.status}).`);
   const audio=Buffer.from(await response.arrayBuffer());if(!audio.length||audio.length>30*1024*1024||!response.headers.get('content-type')?.includes('audio'))throw new AudioError('ElevenLabs não retornou um arquivo de áudio válido.');
   const piece=path.join(temporary,`${i}.mp3`);await writeFile(piece,audio);pieces.push(piece);
  }
  const target=draftPath(jobId);
  if(pieces.length===1)await rename(pieces[0],target);
  else {const list=path.join(temporary,'list.txt');await writeFile(list,pieces.map(p=>`file '${p}'`).join('\n'));await ffmpeg(['-y','-f','concat','-safe','0','-i',list,'-c:a','libmp3lame',target]);}
  await client.query("UPDATE coonto_audio_jobs SET status='ready',updated_at=NOW() WHERE id=$1",[jobId]);
  await recordCrmEvent({type:'audio_draft_generated',userId:actor,relatedType:'audio_job',relatedId:jobId,metadata:{scene:input.sceneId,characters:chars}});
  return jobId;
 }catch(error){
  if(jobId)await client.query("UPDATE coonto_audio_jobs SET status='failed',error_message=$2,updated_at=NOW() WHERE id=$1",[jobId,error instanceof AudioError?error.message:'A geração foi interrompida. O fornecedor pode ter contabilizado parte do texto.']).catch(()=>{});
  throw error;
 }finally{if(temporary)await rm(temporary,{recursive:true,force:true}).catch(()=>{});if(locked)await client.query('SELECT pg_advisory_unlock(180010)').catch(()=>{});client.release();}
}

export async function publishAudio(id:string,actor:string){
 draftPath(id);const client=await getPool().connect();let locked=false;
 try{
  const lock=await client.query<{locked:boolean}>('SELECT pg_try_advisory_lock(180010) AS locked');locked=lock.rows[0].locked;if(!locked)throw new AudioError('Há uma operação em andamento. Aguarde.');
  const rows=await client.query<AudioJob>('SELECT * FROM coonto_audio_jobs WHERE id=$1',[id]);const job=rows.rows[0];if(!job||!['ready','published'].includes(job.status))throw new AudioError('Escolha um rascunho concluído.');
  if(job.work_slug!=='o-alienista'){const work=await getRcWork(job.work_slug);const unit=work.units.find(u=>u.id===job.scene_id);if(!unit||job.segments.length!==1||job.segments[0].speaker!=='narrator'||job.segments[0].text!==unit.title+'. '+unit.context)throw new AudioError('O conteúdo mudou desde a geração. Gere uma abertura correspondente à edição atual.');}
  const directory=path.join(audioDirectory(),job.work_slug);await mkdir(directory,{recursive:true});const target=path.join(directory,job.scene_id+'.mp3');const temporary=target+'.'+id+'.tmp';
  try{await copyFile(draftPath(id),temporary);await rename(temporary,target);{const file=path.join(audioDirectory(),'beta-audio-manifest.json');let manifest:{items:Record<string,unknown>;attempts:unknown[]}={items:{},attempts:[]};try{manifest=JSON.parse(await readFile(file,'utf8'));}catch{}const hash=createHash('sha256').update(JSON.stringify({model:job.model,segments:job.segments.map(s=>({speaker:s.speaker,text:s.text,voiceId:s.voiceId}))})).digest('hex');manifest.items[job.work_slug+'/'+job.scene_id]={hash,status:'ready',model:job.model,jobId:id};const temporaryManifest=file+'.tmp';await writeFile(temporaryManifest,JSON.stringify(manifest,null,2));await rename(temporaryManifest,file);}}finally{await rm(temporary,{force:true}).catch(()=>{});}
  // Versões antigas permanecem guardadas e podem ser restauradas sem nova geração.
  await client.query("UPDATE coonto_audio_jobs SET status='ready',updated_at=NOW() WHERE scene_id=$1 AND status='published' AND id<>$2 AND work_slug=$3",[job.scene_id,id,job.work_slug]);
  await client.query("UPDATE coonto_audio_jobs SET status='published',reviewed_by=$2,updated_at=NOW() WHERE id=$1",[id,actor]);
  await recordCrmEvent({type:'audio_published',userId:actor,relatedType:'audio_job',relatedId:id,metadata:{scene:job.scene_id}});
 }finally{if(locked)await client.query('SELECT pg_advisory_unlock(180010)').catch(()=>{});client.release();}
}

export async function readAudioDraft(id:string){const job=await query<{status:string}>('SELECT status FROM coonto_audio_jobs WHERE id=$1',[id]);if(!job.rows[0]||!['ready','published'].includes(job.rows[0].status))return null;return readFile(draftPath(id));}

export async function betaAudioUsage(days:number){try{const manifest=JSON.parse(await readFile(path.join(audioDirectory(),'beta-audio-manifest.json'),'utf8'));return manifest.attempts.filter((a:{at:number;characters:number})=>a.at>Date.now()-days*86400000).reduce((n:number,a:{characters:number})=>n+a.characters,0);}catch{return 0;}}
