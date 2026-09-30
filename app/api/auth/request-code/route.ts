import { randomInt } from 'node:crypto';
import { query } from '@/lib/db';
import { recordCrmEvent } from '@/lib/crm-events';
import { loginContact,hashLoginCode } from '@/lib/login-contact';
import { sendEmail,sendSms,smsConfigured } from '@/lib/message-provider.cjs';

export async function POST(request:Request) {
  let body;try { body=await request.json(); }catch { return Response.json({error:'Dados inválidos.'},{status:400}); }
  if(!body||typeof body!=='object')return Response.json({error:'Dados inválidos.'},{status:400});
  const contact=loginContact(body);
  if(!contact)return Response.json({error:'Informe um e-mail ou celular válido.'},{status:400});
  if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)return Response.json({error:'Autenticação ainda não configurada.'},{status:503});
  if(contact.channel==='sms'&&!smsConfigured())return Response.json({error:'SMS ainda não disponível. Use o e-mail.'},{status:503});
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||null;
  const recent=await query<{count:string}>("SELECT COUNT(*)::text AS count FROM login_codes WHERE (email=$1 OR ($2::text IS NOT NULL AND requester_ip=$2)) AND created_at>NOW()-INTERVAL '15 minutes'",[contact.key,ip]);
  if(Number(recent.rows[0]?.count||0)>=5)return Response.json({error:'Muitas tentativas. Aguarde alguns minutos.'},{status:429});
  const validationMode=contact.channel==='email'&&process.env.AUTH_MODE==='validation';
  const code=validationMode?String(process.env.VALIDATION_ACCESS_CODE||''):String(randomInt(100000,1000000));
  if(!/^\d{6}$/.test(code))return Response.json({error:'Autenticação ainda não configurada.'},{status:503});
  const id=crypto.randomUUID();
  await query("INSERT INTO login_codes(id,email,code_hash,requester_ip,expires_at) VALUES($1,$2,$3,$4,NOW()+INTERVAL '10 minutes')",[id,contact.key,hashLoginCode(contact.key,code),ip]);
  if(!validationMode)try {
    const text=`Seu código Coonto é ${code}. Ele expira em 10 minutos. Não compartilhe.`;
    if(contact.channel==='email')await sendEmail(contact.value,'Seu código de acesso ao Coonto',text);
    else {
      const submitted=await sendSms(contact.value,text,id);
      await recordCrmEvent({type:'login_sms_submitted',relatedType:'login_code',relatedId:id,channel:'sms',metadata:{mailingId:submitted.mailingId}});
    }
    if(contact.channel==='email')await recordCrmEvent({type:contact.channel==='email'?'login_email_accepted':'login_sms_submitted',relatedType:'login_code',relatedId:id,channel:contact.channel});
  }catch(error) {
    await query('UPDATE login_codes SET used_at=NOW() WHERE id=$1',[id]);
    const failure=error as {code?:string;responseCode?:number;status?:number};
    console.error('login_delivery_failed',{channel:contact.channel,code:failure.code||'delivery_failed',status:failure.responseCode||failure.status||null});
    return Response.json({error:'Não foi possível enviar o código. Tente novamente em alguns minutos.'},{status:503});
  }
  return Response.json({ok:true,mode:validationMode?'validation':contact.channel});
}
