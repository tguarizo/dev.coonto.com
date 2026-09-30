// Shared by login and independent tests. Never log message bodies or credentials.
function smtpOptions(env = process.env) {
  const port = Number(env.SMTP_PORT || 587);
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM || ![465,587].includes(port)) throw new Error('smtp_configuration_missing');
  return {host:env.SMTP_HOST,port,secure:port===465,requireTLS:port===587,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000};
}
function smsConfigured(env = process.env) {
  return env.SMS_ENABLED === 'true' && Boolean(env.SMS_API_TOKEN) && /^\d+$/.test(env.SMS_COST_CENTRE_ID || '');
}
async function sendEmail(to, subject, text, env = process.env, mailer) {
  const transport = (mailer || require('nodemailer')).createTransport(smtpOptions(env));
  try {
    const result = await transport.sendMail({from:env.SMTP_FROM,to,subject,text});
    if (!(result.accepted || []).some(value => String(typeof value === 'string' ? value : value.address).toLowerCase() === to.toLowerCase())) throw new Error('recipient_not_accepted');
    return {accepted:true};
  } finally { transport.close(); }
}
async function sendSms(to, text, reference, env = process.env, fetcher = fetch) {
  if (!smsConfigured(env)) throw new Error('sms_configuration_missing');
  if (!/^55\d{10,11}$/.test(to)) throw new Error('invalid_phone');
  const response = await fetcher('https://sms.mkmservice.com/sms/api/transmission/v1', {
    method:'POST',headers:{Authorization:`Bearer ${env.SMS_API_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({mailing:{identifier:'Coonto - acesso',cost_centre_id:Number(env.SMS_COST_CENTRE_ID)},messages:[{msisdn:to,message:text,reference}]}),
    signal:AbortSignal.timeout(15000),redirect:'error'
  });
  // HTTP success is submission only. Delivery and business-level response validation
  // must be finalized against the provider's documentation before enabling SMS.
  if (!response.ok) { const error = new Error('sms_submission_failed');error.status=response.status;throw error; }
  const result = await response.text();
  if (!result.trim()) throw new Error('sms_empty_response');
  let parsed;try { parsed=JSON.parse(result); } catch { throw new Error('sms_invalid_response'); }
  if (parsed?.error || parsed?.success === false || parsed?.status === 'error') throw new Error('sms_submission_rejected');
  return {submitted:true};
}
module.exports = {smtpOptions,smsConfigured,sendEmail,sendSms};
