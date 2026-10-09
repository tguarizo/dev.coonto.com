// Release notification via existing Coonto/MKOM provider.
// Run only after confirming the RC2 deployment in dev; no OTP or login effects.
const {sendSms}=require('../lib/message-provider.cjs');
(async()=>{
  const version=process.env.COONTO_RELEASE_VERSION;
  const sha=process.env.COONTO_RELEASE_SHA;
  const phone=process.env.COONTO_RC2_NOTIFY_PHONE;
  if(version!=='1.9.6-rc.2')throw Error('release_version_not_rc2');
  if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('release_sha_invalid');
  if(!/^55\d{10,11}$/.test(phone||''))throw Error('sms_recipient_not_configured');
  // Invocation requires separately verified deployment of this exact SHA.
  if(process.env.COONTO_RC2_DEPLOY_CONFIRMED!=='true')throw Error('deployment_not_confirmed');
  const message='Coonto RC2 publicada no ambiente de testes dev.coonto.com. Versao 1.9.6-rc.2, commit '+sha.slice(0,7)+'. Ja pode iniciar a revisao. (Coonto)';
  await sendSms(phone,message,'coonto-rc2-'+sha.slice(0,16));
  console.log(JSON.stringify({status:'submitted_to_provider',deliveryConfirmed:false,version,sha:sha.slice(0,12)}));
})().catch(error=>{console.error(JSON.stringify({status:'failed',reason:error.message}));process.exitCode=1;});
