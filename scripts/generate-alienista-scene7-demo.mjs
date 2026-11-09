import { access, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_COONTO_VOICE_ID || 'czvzJwIVS2asEKnthV40';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const outputDir = path.resolve(process.env.COONTO_SCENE7_AUDIO_DIR || 'audio/o-alienista-scene7-demo');

if (!apiKey) throw new Error('ELEVENLABS_API_KEY is unavailable in the app container.');

const clips = [
  ['consequence-purpose.mp3', 'O plano vai além do acolhimento: Bacamarte pretende observar e classificar seus moradores. Quem será tratado passa a depender do critério de um único médico.'],
  ['consequence-limits.mp3', 'Bacamarte invoca o método, mas não aponta quem fiscaliza suas conclusões. Sem contestação, os moradores ficam sujeitos à classificação do próprio médico.'],
  ['consequence-city.mp3', 'Ele pede que a vila observe os resultados, mas também será ele quem escolherá o que conta como resultado. A população não tem como verificar as conclusões.'],
  ['consequence-green.mp3', 'A curiosidade pela cor leva à pergunta sobre quem será observado ali dentro. A Casa Verde passa de edifício curioso a instituição que pode classificar pessoas.'],
  ['consequence-people.mp3', 'Se Bacamarte decide quem se afastou da razão, sua definição determina quem será acolhido, observado ou privado da liberdade dentro da Casa Verde.']
];

await mkdir(outputDir, { recursive: true });

for (const [filename, text] of clips) {
  const destination = path.join(outputDir, filename);
  try {
    await access(destination);
    console.log(`Mantido: ${filename}`);
    continue;
  } catch {}

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
        model_id: modelId,
        language_code: 'pt',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }),
      signal: AbortSignal.timeout(180000)
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs rejected ${filename} (${response.status}).`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (!audio.length || !response.headers.get('content-type')?.includes('audio')) {
    throw new Error(`ElevenLabs returned an invalid audio file for ${filename}.`);
  }

  const temporary = destination + '.tmp';
  await writeFile(temporary, audio, { mode: 0o644 });
  await rename(temporary, destination);
  console.log(`Gerado: ${filename}`);
}
