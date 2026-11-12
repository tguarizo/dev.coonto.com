const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY não está disponível no container.');
const response = await fetch('https://api.elevenlabs.io/v1/voices', {
  headers: { 'xi-api-key': apiKey, Accept: 'application/json' },
  signal: AbortSignal.timeout(60000)
});
if (!response.ok) throw new Error('ElevenLabs respondeu ' + response.status + ' ao consultar vozes.');
const data = await response.json();
const voices = (data.voices || [])
  .filter(voice => voice.category === 'premade')
  .map(({ voice_id, name, labels = {} }) => ({ voice_id, name, labels }))
  .sort((a, b) => a.name.localeCompare(b.name));
console.log(JSON.stringify(voices));
