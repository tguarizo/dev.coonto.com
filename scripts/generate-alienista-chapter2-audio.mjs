import { access, mkdir, rename, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const source = 'content/alienista-chapter2-voice-lines.json';
const outputDir = path.resolve(process.env.COONTO_CH2_AUDIO_DIR || 'audio/o-alienista-chapter2');
const apiKey = process.env.ELEVENLABS_API_KEY;
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const defaultNarrator = process.env.ELEVENLABS_COONTO_VOICE_ID || 'czvzJwIVS2asEKnthV40';
const voices = {
  narrator: defaultNarrator,
  bacamarte: process.env.ELEVENLABS_BACAMARTE_VOICE_ID || defaultNarrator,
  crispim: process.env.ELEVENLABS_CRISPIM_VOICE_ID || defaultNarrator,
  padre: process.env.ELEVENLABS_PADRE_VOICE_ID || defaultNarrator,
  patient: process.env.ELEVENLABS_PATIENT_VOICE_ID || defaultNarrator
};

const clips = JSON.parse(await readFile(source, 'utf8'));
const characters = clips.reduce((sum, clip) => sum + clip.text.length, 0);
if (!Array.isArray(clips) || clips.some(clip => !/^[a-z0-9_-]+$/.test(clip.id) || !voices[clip.speaker] || !clip.text.trim())) {
  throw new Error('Lista de falas inválida.');
}
if (process.argv.includes('--report')) {
  console.log(JSON.stringify({ clips: clips.length, characters, speakers: [...new Set(clips.map(clip => clip.speaker))] }));
  process.exit(0);
}
if (!process.argv.includes('--generate')) throw new Error('Use --report ou --generate.');
if (!apiKey) throw new Error('ELEVENLABS_API_KEY não está disponível no container.');
await mkdir(outputDir, { recursive: true });

for (const clip of clips) {
  const destination = path.join(outputDir, clip.id + '.mp3');
  try {
    await access(destination);
    console.log('Mantido: ' + clip.id + '.mp3');
    continue;
  } catch {}

  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voices[clip.speaker]) + '?output_format=mp3_44100_128',
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text: clip.text,
        model_id: modelId,
        language_code: 'pt',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }),
      signal: AbortSignal.timeout(180000)
    }
  );
  if (!response.ok) throw new Error('ElevenLabs respondeu ' + response.status + ' para ' + clip.id + '; sem repetição automática.');
  const audio = Buffer.from(await response.arrayBuffer());
  if (!audio.length || audio.length > 30 * 1024 * 1024 || !response.headers.get('content-type')?.includes('audio')) {
    throw new Error('Arquivo inválido para ' + clip.id);
  }

  const temporary = destination + '.tmp';
  await writeFile(temporary, audio, { mode: 0o644 });
  await rename(temporary, destination);
  console.log('Gerado: ' + clip.id + '.mp3');
  await new Promise(resolve => setTimeout(resolve, 500));
}
