// Reutiliza o vídeo aprovado e a locução gerada; não chama nenhum fornecedor.
import {readFile,writeFile,rename,mkdir,access,copyFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const dir=path.resolve(process.env.COONTO_AUDIO_DIR||'audio'),source=path.resolve('public/videos/depois-da-aula.mp4'),intro=path.join(dir,'videos/depois-da-aula-intro.mp3'),target=path.join(dir,'videos/depois-da-aula.mp4'),meta=target+'.json';
const hash=createHash('sha256').update(await readFile(source)).update(await readFile(intro)).update('intro-duck-v1').digest('hex');
try{if(JSON.parse(await readFile(meta,'utf8')).hash===hash){await access(target);console.log('Vídeo depois da aula: introdução já pronta, preservada.');process.exit(0);}}catch{}
const duration=Number(spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',intro],{encoding:'utf8'}).stdout.trim());if(!(duration>0&&duration<15))throw new Error('A locução de introdução deve ter entre 0 e 15 segundos.');
await mkdir(path.dirname(target),{recursive:true});const temporary=path.join(dir,'videos','intro-'+randomUUID()+'.mp4');
const filter=`[0:a]volume='if(lt(t,${duration}),0.12,1)':eval=frame[original];[1:a]apad[narration];[original][narration]amix=inputs=2:duration=first:normalize=0[audio]`;
const rendered=spawnSync('ffmpeg',['-y','-i',source,'-i',intro,'-filter_complex',filter,'-map','0:v:0','-map','[audio]','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',temporary],{encoding:'utf8',timeout:120000});if(rendered.status!==0)throw new Error('Não foi possível combinar a introdução com o vídeo.');
const history=path.join(dir,'versions','videos','depois-da-aula');await mkdir(history,{recursive:true});try{await copyFile(target,path.join(history,Date.now()+'.mp4'));}catch(error){if(error.code!=='ENOENT')throw error;}
await rename(temporary,target);const temporaryMeta=meta+'.tmp';await writeFile(temporaryMeta,JSON.stringify({hash,introDuration:duration,createdAt:new Date().toISOString()}));await rename(temporaryMeta,meta);console.log('Vídeo depois da aula: locução de introdução incorporada; imagens e restante do áudio preservados.');
