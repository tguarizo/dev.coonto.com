import {requireCrmHost} from '@/lib/admin-host';
import {requireUser} from '@/lib/auth';
import {query} from '@/lib/db';
import {audioWritable,type AudioJob} from '@/lib/audio-production';
import {SiteHeader} from '@/components/site-header';
import {AudioStudio} from '@/components/audio-studio';
import scripts from '@/content/o-alienista-audio.json';
import scenes from '@/content/o-alienista-scenes.json';
export const dynamic='force-dynamic';
export default async function AudioPage(){
 await requireCrmHost();const user=await requireUser('/backoffice/audio');if(user.role!=='admin')return <main><h1>Acesso restrito</h1></main>;
 const [result,writable,usage]=await Promise.all([query<AudioJob>('SELECT * FROM coonto_audio_jobs ORDER BY created_at DESC LIMIT 1000'),audioWritable(),query<{requested:string}>("SELECT COALESCE(SUM(requested_characters),0)::text AS requested FROM coonto_audio_jobs WHERE created_at>NOW()-INTERVAL '30 days'")]);
 const key=Boolean(process.env.ELEVENLABS_API_KEY),narrator=Boolean(process.env.ELEVENLABS_NARRATOR_VOICE_ID),bacamarte=Boolean(process.env.ELEVENLABS_BACAMARTE_VOICE_ID);
 const jobs=result.rows.map(j=>({...j,created_at:new Date(j.created_at).toISOString(),updated_at:new Date(j.updated_at).toISOString()}));
 const items=scenes.map(s=>({id:s.id,title:s.title,segments:(scripts.find(x=>x.id===s.id)?.segments||[]).map(x=>({speaker:x.speaker as 'narrator'|'bacamarte',text:x.text}))}));
 return <main className="backoffice"><SiteHeader/><div className="content crm-page"><section className="backoffice-hero"><span className="section-kicker">CRM · ÁUDIO DAS OBRAS</span><h1>Produzir, ouvir e aprovar</h1><p>Prepare o áudio de O Alienista sem comandos no servidor. Gere uma amostra, ouça e aprove. Depois produza as demais cenas e revise uma por uma.</p></section><section className="dashboard-card"><h2>Configuração e uso</h2><p>ElevenLabs: {key?'chave configurada':'aguarda configuração'}. Narradora: {narrator?'configurada':'aguarda voz'}. Bacamarte: {bacamarte?'configurado':'aguarda voz'}. Gravação dos arquivos: {writable?'disponível':'indisponível'}.</p><p>Modelo: {process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2'}. Últimos 30 dias: {Number(usage.rows[0].requested).toLocaleString('pt-BR')} caracteres enviados para geração. Esse número inclui tentativas interrompidas e não equivale ao saldo ou à cobrança confirmada.</p><p>O áudio só entra na leitura ao clicar em <strong>Aprovar e publicar</strong>. Para ouvir a versão nova sem internet, atualize a cópia da obra em “Salvar neste aparelho”.</p></section><AudioStudio scenes={items} jobs={jobs} ready={key&&narrator&&writable}/></div></main>;
}
