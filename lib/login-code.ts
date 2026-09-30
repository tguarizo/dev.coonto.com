import {timingSafeEqual} from 'node:crypto';
import type {PoolClient} from 'pg';
import {transaction} from '@/lib/transaction';
export async function consumeLoginCode(email:string,suppliedHash:string,beforeConsume?:(client:PoolClient)=>Promise<boolean>){
 return transaction(async client=>{
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['login:'+email]);
  const pending=await client.query<{id:string;code_hash:string;attempts:number}>("SELECT id,code_hash,attempts FROM login_codes WHERE email=$1 AND used_at IS NULL AND expires_at>NOW() ORDER BY created_at DESC LIMIT 10 FOR UPDATE",[email]);
  const attempts=Math.max(0,...pending.rows.map(row=>row.attempts));
  const match=pending.rows.find(row=>{const a=Buffer.from(row.code_hash,'hex'),b=Buffer.from(suppliedHash,'hex');return a.length===b.length&&timingSafeEqual(a,b);});
  if(match&&attempts<10){
   if(beforeConsume && !await beforeConsume(client))return {ok:false,error:'',needsName:true};
   // Uma autenticação consome todas as versões pendentes, impedindo uso posterior ou simultâneo.
   await client.query('UPDATE login_codes SET used_at=NOW() WHERE email=$1 AND used_at IS NULL',[email]);return {ok:true,error:''};
  }
  if(pending.rows.length)await client.query("UPDATE login_codes SET attempts=$2,used_at=CASE WHEN $2>=10 THEN NOW() ELSE used_at END WHERE email=$1 AND used_at IS NULL AND expires_at>NOW()",[email,attempts+1]);
  const known=await client.query<{expired:boolean;used:boolean}>("SELECT expires_at<=NOW() AS expired,used_at IS NOT NULL AS used FROM login_codes WHERE email=$1 AND code_hash=$2 AND created_at>NOW()-INTERVAL '24 hours' ORDER BY created_at DESC LIMIT 1",[email,suppliedHash]);
  const old=known.rows[0];return {ok:false,error:old?.expired?'Este código expirou. Clique em Reenviar código para receber outro.':old?.used?'Este código já foi utilizado ou bloqueado. Solicite um novo código.':'O código não confere. Verifique os seis números recebidos.'};
 });
}
