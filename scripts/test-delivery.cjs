// Independent provider test: no database, account, session or login code.
const {sendEmail,sendSms}=require('../lib/message-provider.cjs');
const [channel,to]=process.argv.slice(2);
(async()=>{
 if(!to||!['email','sms'].includes(channel))throw new Error('usage');
 const text='Teste de envio do Coonto. Esta mensagem confirma o teste independente do provedor; não é um código de login.';
 if(channel==='email')await sendEmail(to,'Coonto - teste de envio de e-mail',text);
 else await sendSms(to,text,'coonto-test-'+Date.now());
 console.log(JSON.stringify({channel,status:channel==='email'?'accepted_by_smtp':'submitted_to_sms_api',deliveryConfirmed:false}));
})().catch(error=>{
 console.error(JSON.stringify({channel:channel||null,status:'failed',code:error.code||'test_failed',httpStatus:error.status||null,smtpStatus:error.responseCode||null}));
 process.exitCode=1;
});
