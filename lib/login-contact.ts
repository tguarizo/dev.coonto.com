import { createHmac } from 'node:crypto';
export type LoginChannel = 'email' | 'sms';
export function loginContact(body: {channel?:unknown;email?:unknown;phone?:unknown}) {
  if(body.channel !== undefined && body.channel !== 'email' && body.channel !== 'sms') return null;
  const channel:LoginChannel = body.channel === 'sms' ? 'sms' : 'email';
  if(channel === 'email') {
    const value=String(body.email||'').trim().toLowerCase();
    return value.length<=320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? {channel,value,key:value} : null;
  }
  let value=String(body.phone||'').replace(/[\s()+.-]/g,'');
  if(/^\d{10,11}$/.test(value))value='55'+value;
  if(!/^55[1-9]\d(?:[2-5]\d{7}|9\d{8})$/.test(value))return null;
  return {channel,value,key:'sms:'+value};
}
export const hashLoginCode=(key:string,code:string)=>createHmac('sha256',process.env.AUTH_SECRET||'').update(`${key}:${code}`).digest('hex');
export function safeReturnTo(value:unknown) {
  if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f]/.test(value))return '/minha-biblioteca';
  return value;
}
