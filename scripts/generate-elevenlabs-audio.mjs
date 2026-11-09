import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve('generated-audio');
const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'czvzJwIVS2asEKnthV40';

if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY GitHub Actions secret.');

const clips = [
  ['office-three-days.mp3', 'Três dias depois.'],
  ['office-door.mp3', 'Alguém bate à porta.'],
  ['answer-transition.mp3', 'Bacamarte pensa um instante antes de responder.'],
  ['consequence-transition.mp3', 'Agora, conheça as consequências dessa escolha em Itaguaí.'],
  ['author-transition.mp3', 'Depois das consequências, conheça o caminho de Machado de Assis.']
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
        model_id: 'eleven_v4',
        language_code: 'pt'
      })
    }
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`ElevenLabs rejected ${filename} (${response.status}): ${detail}`);
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
    throw new Error(`Could not normalize ${filename}: ${normalized.stderr?.toString() || normalized.error?.message}`);
  }

  console.log(`Generated and normalized: ${filename}`);
}
