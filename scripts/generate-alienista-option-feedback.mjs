import { access, mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_COONTO_VOICE_ID || 'czvzJwIVS2asEKnthV40';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const outputDir = path.resolve(process.env.COONTO_OPTION_AUDIO_DIR || 'audio/o-alienista-option-feedback');

if (!apiKey) throw new Error('ELEVENLABS_API_KEY is unavailable in the private app container.');

const clips = [
  ['s10-a.mp3', 'Leitura mais sustentada. A expansão do diagnóstico depende do novo critério, não de uma transformação súbita da vila.'],
  ['s10-b.mp3', 'Esse dado não sustenta a interpretação.'],
  ['s10-c.mp3', 'Esse episódio pertence a outro eixo da narrativa.'],
  ['s15-a.mp3', 'Reduz demais a complexidade do personagem.'],
  ['s15-b.mp3', 'Leitura mais sustentada. A revolta nasce de um problema real, mas a liderança não é transparente nem pura.'],
  ['s15-c.mp3', 'O texto é bem menos simples que isso.'],
  ['s25-a.mp3', 'Nada no episódio sugere heroísmo cívico simples.'],
  ['s25-b.mp3', 'Leitura mais sustentada. A cena vale pelo descompasso entre parecer e agir.'],
  ['s25-c.mp3', 'O consenso está longe.'],
  ['s32-a.mp3', 'Leitura mais sustentada. Internar a própria esposa complica a hipótese de puro interesse material.'],
  ['s32-b.mp3', 'Na verdade, a cena tende a reforçar essa leitura extrema.'],
  ['s32-c.mp3', 'O episódio confirma, e não enfraquece, essa dimensão.'],
  ['s41-a.mp3', 'Leitura mais sustentada. A cena mantém a suspeita sobre quem julga o julgador.'],
  ['s41-b.mp3', 'Essa não é a questão central.'],
  ['s41-c.mp3', 'Esse fato não ocorre.']
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
// v58: generate five scene checkpoints with three Murilo feedback choices each.
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
    throw new Error(`ElevenLabs rejected ${filename} (${response.status}); no automatic retry.`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (!audio.length || !response.headers.get('content-type')?.includes('audio')) {
    throw new Error(`ElevenLabs returned an invalid audio file for ${filename}.`);
  }

  const temporary = destination + '.tmp';
  await writeFile(temporary, audio, { mode: 0o644 });
  await rename(temporary, destination);
  console.log(`Gerado com a voz ${voiceId}: ${filename} (${text.length} caracteres).`);
}

if (clips.length !== 15) throw new Error('Expected exactly fifteen option feedback clips.');
