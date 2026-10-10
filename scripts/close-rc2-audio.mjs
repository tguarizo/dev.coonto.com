import {spawnSync} from 'node:child_process';
import {checkBudget} from './audio-budget.cjs';
const works=['memorias-de-martha','divina-comedia-canto-i','o-alienista'];
function run(args,capture=false){const r=spawnSync(process.execPath,['scripts/generate-beta-audio.mjs',...args],{encoding:'utf8',stdio:capture?'pipe':'inherit'});if(r.status!==0)throw new Error(capture?r.stderr:'Etapa de áudio falhou.');return capture?JSON.parse(r.stdout):null;}
const reports=works.map(w=>run(['--work='+w,'--report'],true));
const characters=reports.reduce((n,r)=>n+r.pendingCharacters,0);
if(characters){
 if(!process.env.ELEVENLABS_API_KEY)throw new Error('Chave do fornecedor ausente.');
 const response=await fetch('https://api.elevenlabs.io/v1/user/subscription',{headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Não foi possível consultar créditos: '+response.status);
 console.log('RC2.2 audio budget: '+JSON.stringify(checkBudget(await response.json(),characters,reports[0].model)));
}
for(const work of works){run(['--generate','--work='+work]);run(['--audit','--work='+work]);}
console.log('RC2.2: todos os áudios correspondem ao texto atual, estão publicados e têm duração válida.');
