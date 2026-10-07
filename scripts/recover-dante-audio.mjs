// Dev-only repair of the audio identifier constraint; no rights or progress changes.
import {readFile} from 'node:fs/promises';
import pg from 'pg';
if(new URL(process.env.APP_URL||'https://invalid.local').hostname!=='dev.coonto.com'||!process.env.DATABASE_URL)throw new Error('Recuperação restrita ao ambiente dev.');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
try{await pool.query(await readFile(new URL('./022_dante_interaction_audio.sql',import.meta.url),'utf8'));console.log('Restrição de áudio Dante corrigida; registros existentes preservados.');}finally{await pool.end();}
