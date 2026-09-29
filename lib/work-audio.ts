import path from 'node:path';
export function audioDirectory(){return path.resolve(process.env.COONTO_AUDIO_DIR||path.join(process.cwd(),'audio'));}
