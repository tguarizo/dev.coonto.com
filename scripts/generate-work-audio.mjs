// node --env-file=.env scripts/generate-work-audio.mjs [--generate] [--scene=s2] [--force]
// Sem --generate: apenas prévia, nenhum crédito consumido.
import {readFile,mkdir,access,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2),generate=args.includes('--generate'),force=args.includes('--force');
const selected=args.find(a=>a.startsWith('--scene='))?.slice(8);
const scenes=JSON.parse(await readFile('content/o-alienista-audio.json','utf8')).filter(s=>!selected||s.id===selected);
if(!scenes.length)throw new Error('Cena não encontrada.');
const output=path.resolve(process.env.COONTO_AUDIO_OUTPUT_DIR||'audio','o-alienista');
const model=process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2';
let total=0;
for(const scene of scenes){
 const target=path.join(output,scene.id+'.mp3');let exists=false;try{await access(target);exists=true;}catch{}
 if(exists&&!force){console.log(`${scene.id}: já produzido; preservado.`);continue;}
 const chars=scene.segments.reduce((n,s)=>n+s.text.length,0);total+=chars;
 console.log(`${scene.id}: ${chars} caracteres, ${scene.segments.map(s=>s.speaker).join(', ')}.`);
 if(!generate)continue;
 if(!process.env.ELEVENLABS_API_KEY)throw new Error('Configure ELEVENLABS_API_KEY no ambiente privado.');
 if(scene.segments.length>1&&spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status!==0)throw new Error('ffmpeg é necessário para unir trechos de duas vozes.');
 await mkdir(output,{recursive:true});const pieces=[];
 for(let i=0;i<scene.segments.length;i++){
  const segment=scene.segments[i];const voice=segment.speaker==='bacamarte'?process.env.ELEVENLABS_BACAMARTE_VOICE_ID:segment.speaker==='narrator'?process.env.ELEVENLABS_NARRATOR_VOICE_ID:null;
  if(!voice)throw new Error(`Configure a voz de ${segment.speaker}.`);
  const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:segment.text,model_id:model,language_code:'pt',voice_settings:{stability:0.5,similarity_boost:0.75}}),signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error(`ElevenLabs respondeu ${response.status}; geração interrompida.`);
  const piece=path.join(output,`${scene.id}-part-${i}.mp3`);await writeFile(piece,Buffer.from(await response.arrayBuffer()));pieces.push(piece);
 }
 if(pieces.length===1)await rename(pieces[0],target);
 else {const result=spawnSync('ffmpeg',['-y','-i','concat:'+pieces.join('|'),'-c:a','libmp3lame',target],{stdio:'ignore'});if(result.status!==0)throw new Error('Falha ao combinar trechos.');}
 console.log(`${scene.id}: salvo.`);
}
console.log(`${generate?'Geração concluída':'Prévia sem consumo'}: ${total} caracteres. Corrija apenas as cenas necessárias com --scene e --force.`);
