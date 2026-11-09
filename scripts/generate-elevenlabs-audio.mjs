import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve('generated-audio');
const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'czvzJwIVS2asEKnthV40';

if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY GitHub Actions secret.');

const clips = [
  ['consequence-purpose.mp3', 'O plano vai além do acolhimento: Bacamarte pretende observar e classificar seus moradores. Quem será tratado passa a depender do critério de um único médico.'],
  ['consequence-limits.mp3', 'Bacamarte invoca o método, mas não aponta quem fiscaliza suas conclusões. Sem contestação, os moradores ficam sujeitos à classificação do próprio médico.'],
  ['consequence-city.mp3', 'Ele pede que a vila observe os resultados, mas também será ele quem escolherá o que conta como resultado. A população não tem como verificar as conclusões.'],
  ['consequence-green.mp3', 'A curiosidade pela cor leva à pergunta sobre quem será observado ali dentro. A Casa Verde passa de edifício curioso a instituição que pode classificar pessoas.'],
  ['consequence-people.mp3', 'Se Bacamarte decide quem se afastou da razão, sua definição determina quem será acolhido, observado ou privado da liberdade dentro da Casa Verde.']
];

const ffmpeg = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
if (ffmpeg.error || ffmpeg.status !== 0) throw new Error('ffmpeg is required to normalize audio.');

await mkdir(outputDir, { recursive: true });

for (const [filename, text] of clips) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'pt',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs rejected ${filename} (${response.status}).`);
  }

  const rawAudio = Buffer.from(await response.arrayBuffer());
  const output = path.join(outputDir, filename);
  const normalized = spawnSync(
    'ffmpeg',
    [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', 'pipe:0',
      '-af', 'loudnorm=I=-16:TP=-2:LRA=5',
      '-ar', '44100', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '128k',
      output
    ],
    { input: rawAudio, encoding: 'buffer', maxBuffer: 4 * 1024 * 1024 }
  );

  if (normalized.error || normalized.status !== 0) {
    throw new Error(`Could not normalize ${filename}.`);
  }

  console.log(`Generated and normalized: ${filename}`);
}
