import {readFile,mkdir,access,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';

const items=JSON.parse(await readFile('content/home-example-audio.json','utf8'));
const output=path.resolve(process.env.COONTO_AUDIO_DIR||'/app/audio','home-examples');
const model=process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2';
const key=process.env.ELEVENLABS_API_KEY;
const voice=process.env.ELEVENLABS_NARRATOR_VOICE_ID;
if(!key||!voice)throw new Error('Homepage audio credentials missing.');
await mkdir(output,{recursive:true});
for(const item of items){
  const target=path.join(output,item.id+'.mp3');
  try{await access(target);console.log(item.id+': preserved');continue;}catch{}
  const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice)+'?output_format=mp3_44100_128',{
    method:'POST',
    headers:{'xi-api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify({text:item.text,model_id:model,language_code:'pt',voice_settings:{stability:0.5,similarity_boost:0.75}}),
    signal:AbortSignal.timeout(60000)
  });
  if(!response.ok)throw new Error(item.id+': ElevenLabs '+response.status);
  const temp=target+'.tmp';
  await writeFile(temp,Buffer.from(await response.arrayBuffer()));
  await rename(temp,target);
  console.log(item.id+': generated');
}
console.log('Homepage literary audio ready.');
