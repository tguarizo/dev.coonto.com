import {randomUUID} from 'node:crypto';
import type {PoolClient} from 'pg';

type Client=Pick<PoolClient,'query'>;
export const ADMINISTRATION_LOCK=170017;

// Called only within the successful email OTP transaction. An environment
// indication authorizes this first account; OTP alone does not grant rights.
export async function activateInitialAdministrator(client:Client,userId:string,email:string,configuredEmail:string,authMode:string){
  const configured=configuredEmail.trim().toLowerCase();
  if(authMode!=='email'||!configured||configured!==email||!/^master@coonto\.com$/.test(configured))return false;
  await client.query('SELECT pg_advisory_xact_lock($1)',[ADMINISTRATION_LOCK]);
  const account=await client.query('SELECT 1 FROM users WHERE id=$1 AND email=$2',[userId,email]);
  if(!account.rowCount)return false;
  const receipt=await client.query(`INSERT INTO administration_bootstrap(singleton,initial_user_id,initial_email)
    VALUES(TRUE,$1,$2) ON CONFLICT(singleton) DO NOTHING RETURNING initial_user_id`,[userId,email]);
  if(!receipt.rowCount)return false;
  await client.query("UPDATE users SET role='admin' WHERE id=$1",[userId]);
  await client.query(`INSERT INTO crm_events(id,event_type,user_id,related_type,related_id,channel)
    VALUES($1,'administration_bootstrap_activated',$2,'user',$2,'email')`,[randomUUID(),userId]);
  return true;
}

// All administrator withdrawals (including persona edits) use this guard.
// The caller holds ADMINISTRATION_LOCK for the whole role change transaction.
export async function guardInitialAdministratorWithdrawal(client:Client,targetId:string,actorId:string){
  const bootstrap=await client.query('SELECT 1 FROM administration_bootstrap WHERE initial_user_id=$1',[targetId]);
  if(!bootstrap.rowCount)return;
  const successor=await client.query(`SELECT 1 FROM users u WHERE u.id<>$1 AND u.role='admin'
    AND EXISTS(SELECT 1 FROM sessions s WHERE s.user_id=u.id AND s.expires_at>NOW()) LIMIT 1`,[targetId]);
  if(!successor.rowCount)throw new Error('Antes de retirar o acesso inicial, outro administrador precisa confirmar o código e entrar.');
  await client.query(`UPDATE administration_bootstrap SET retired_at=COALESCE(retired_at,NOW()),retired_by=COALESCE(retired_by,$2)
    WHERE initial_user_id=$1`,[targetId,actorId]);
}
