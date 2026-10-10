// Publishes both revised editions atomically, only over the reviewed predecessor.
import {readFile} from 'node:fs/promises';
import pg from 'pg';
import {isDeepStrictEqual} from 'node:util';
if(!process.argv.includes('--publish-dev')||new URL(process.env.APP_URL||'https://invalid.local').hostname!=='dev.coonto.com')throw new Error('Publicação restrita ao Coonto dev.');
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL ausente.');
const editions=await Promise.all(['memorias-de-martha','divina-comedia-canto-i'].map(async slug=>({work:JSON.parse(await readFile(`content/rc-${slug}.json`,'utf8')),previous:JSON.parse(await readFile(`deploy/rc2.2/previous-${slug}.json`,'utf8'))})));
const normalize=work=>({...work,version:''});
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL}),client=await pool.connect();
try{
 await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(180014)');await client.query('SELECT pg_advisory_xact_lock(180015)');
 for(const {work,previous} of editions){
  const current=(await client.query("SELECT id,content FROM rc_content_versions WHERE work_slug=$1 AND status='published' FOR UPDATE",[work.slug])).rows;
  if(current.length>1)throw new Error(`Mais de uma edição publicada: ${work.slug}`);
  const existing=(await client.query('SELECT status,content FROM rc_content_versions WHERE id=$1',[work.version])).rows[0];
  if(existing){if(existing.status!=='published'||!isDeepStrictEqual(normalize(existing.content),normalize(work)))throw new Error(`Edição já registrada com outro estado: ${work.slug}`);continue;}
  if(current[0]&&!isDeepStrictEqual(normalize(current[0].content),normalize(previous)))throw new Error(`A curadoria alterou ${work.slug}; compare a edição atual antes de publicar.`);
  await client.query("UPDATE rc_content_versions SET status='archived' WHERE work_slug=$1 AND status='published'",[work.slug]);
  await client.query("INSERT INTO rc_content_versions(id,work_slug,content,status,published_at) VALUES($1,$2,$3::jsonb,'published',NOW())",[work.version,work.slug,JSON.stringify(work)]);
 }
 await client.query('COMMIT');console.log('Edições RC2.2 publicadas em dev. Históricos e notas preservados; sem atribuir aprovação de curador.');
}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
