import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { deviceCookie,hashToken,sessionCookie } from '@/lib/auth';
import { query } from '@/lib/db';
import { recordCrmEvent } from '@/lib/crm-events';
import { consumeLoginCode } from '@/lib/login-code';
import { loginContact,hashLoginCode,safeReturnTo } from '@/lib/login-contact';
import { smsConfigured } from '@/lib/message-provider.cjs';
import { activateInitialAdministrator } from '@/lib/administration-bootstrap';

export async function POST(request:Request) {
  let body;try {body=await request.json();}catch{return Response.json({error:'Dados inválidos.'},{status:400});}
  if(!body||typeof body!=='object')return Response.json({error:'Dados inválidos.'},{status:400});
  const contact=loginContact(body),code=String(body.code||'').trim();
  if(!contact||!/^\d{6}$/.test(code))return Response.json({error:'Confira o contato e o código de seis números.'},{status:400});
  if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)return Response.json({error:'Autenticação ainda não configurada.'},{status:503});
  if(contact.channel==='sms'&&!smsConfigured())return Response.json({error:'SMS ainda não disponível. Use o e-mail.'},{status:503});
  const name=String(body.name||'').trim().replace(/\s+/g,' ');
  if(name.length>100)return Response.json({error:'Use um nome de até 100 caracteres.'},{status:400});
  let userId='';
  const token=randomBytes(32).toString('base64url');
  const existingDeviceToken=(await cookies()).get(deviceCookie.name)?.value||'';
  const deviceToken=existingDeviceToken||randomBytes(32).toString('base64url');
  const userAgent=request.headers.get('user-agent')||'';
  const deviceLabel=/iPhone|Android/i.test(userAgent)?'Celular':/iPad|Tablet/i.test(userAgent)?'Tablet':'Computador';
  const jar=await cookies();
  const admins=String(process.env.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  const checked=await consumeLoginCode(contact.key,hashLoginCode(contact.key,code),async client=>{
    // Same transaction and contact lock as code consumption: no orphan accounts
    // and no consumed code when the first-access name still needs to be supplied.
    const existing=await client.query<{id:string}>(contact.channel==='email'?'SELECT id FROM users WHERE email=$1':'SELECT id FROM users WHERE phone=$1',[contact.value]);
    if(existing.rows[0]){
      userId=existing.rows[0].id;
      await client.query('UPDATE users SET last_seen_at=NOW() WHERE id=$1',[userId]);
    }else{
      if(name.length<2)return false;
      userId=crypto.randomUUID();
      await client.query("INSERT INTO users(id,email,phone,name,account_kind,plan) VALUES($1,$2,$3,$4,'guest','guest')",[userId,contact.channel==='email'?contact.value:null,contact.channel==='sms'?contact.value:null,name]);
    }
    // SMS alone cannot claim an account authorized through somebody else's email.
    if(contact.channel==='email'){
      // Never let the legacy recurring allowlist resurrect this temporary account.
      if(contact.value!=='master@coonto.com'&&admins.includes(contact.value))await client.query("UPDATE users SET role='admin' WHERE id=$1",[userId]);
      await activateInitialAdministrator(client,userId,contact.value,process.env.COONTO_BOOTSTRAP_MASTER_EMAIL||'',process.env.AUTH_MODE||'');
    }
    await client.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')",[hashToken(token),userId]);
    const deviceHash=hashToken(deviceToken);
    const knownDevice=await client.query("SELECT id FROM auth_devices WHERE user_id=$1 AND token_hash=$2 AND revoked_at IS NULL LIMIT 1",[userId,deviceHash]);
    if(knownDevice.rows[0]){
      await client.query("UPDATE auth_devices SET label=$1,trusted_until=NOW()+INTERVAL '90 days',last_seen_at=NOW() WHERE id=$2",[deviceLabel,knownDevice.rows[0].id]);
    }else{
      await client.query("INSERT INTO auth_devices(id,user_id,token_hash,label,trusted_until) VALUES($1,$2,$3,$4,NOW()+INTERVAL '90 days')",[crypto.randomUUID(),userId,deviceHash,deviceLabel]);
      await client.query("UPDATE auth_devices SET revoked_at=NOW() WHERE id IN (SELECT id FROM auth_devices WHERE user_id=$1 AND revoked_at IS NULL ORDER BY last_seen_at DESC,created_at DESC OFFSET 3)",[userId]);
    }
    return true;
  });
  if('needsName' in checked&&checked.needsName)return Response.json({needsName:true,message:'Como podemos chamar você?'});
  if(!checked.ok)return Response.json({error:checked.error},{status:401});
  jar.set(sessionCookie.name,token,sessionCookie.options);
  jar.set(deviceCookie.name,deviceToken,deviceCookie.options);
  const referralCode=jar.get('coonto_ref')?.value;
  if(referralCode&&/^[A-Z0-9]{12}$/.test(referralCode))try{
    await query('INSERT INTO referral_attributions(user_id,referral_id) SELECT $1,id FROM partner_referrals WHERE code=$2 AND active=TRUE ON CONFLICT(user_id) DO NOTHING',[userId,referralCode]);
  }catch {console.error('referral_attribution_failed');}
  await recordCrmEvent({type:'login_succeeded',userId,channel:contact.channel,metadata:{device:deviceLabel}});
  return Response.json({ok:true,returnTo:safeReturnTo(body.returnTo)});
}
