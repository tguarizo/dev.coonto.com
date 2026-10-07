// Explicit dev publication, authorized for the full editorial v1 reader trial.
// No user, entitlement, progress, permission or curator approval is changed.
import {readFile} from 'node:fs/promises';
import pg from 'pg';
if(!process.argv.includes('--publish-dev')||new URL(process.env.APP_URL||'https://invalid.local').hostname!=='dev.coonto.com')throw new Error('Publicação restrita ao Coonto dev.');
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL ausente.');
const work=JSON.parse(await readFile('content/rc-divina-comedia-canto-i.json','utf8'));
if(work.version!=='dante-editorial-v1-rc1'||work.units.length!==6||work.units.flatMap(u=>u.interactions||[]).length!==14)throw new Error('Roteiro completo inválido.');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL}),client=await pool.connect();
try{
 await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(180015)');
 const existing=await client.query('SELECT id,status FROM rc_content_versions WHERE id=$1',[work.version]);
 if(existing.rows.length){console.log('Dante v1 já registrada; a publicação atual da curadoria foi preservada.');}
 else{
  await client.query("UPDATE rc_content_versions SET status='archived' WHERE work_slug=$1 AND status='published'",[work.slug]);
  await client.query("INSERT INTO rc_content_versions(id,work_slug,content,status,published_at) VALUES($1,$2,$3::jsonb,'published',NOW())",[work.version,work.slug,JSON.stringify(work)]);
  console.log('Dante editorial v1 publicada em dev para avaliação. Versões anteriores arquivadas; nenhuma aprovação de curador foi atribuída.');
 }
 await client.query('COMMIT');
} catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
