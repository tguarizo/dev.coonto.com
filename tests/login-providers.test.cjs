const {test}=require('node:test');
const assert=require('node:assert/strict');
const {smtpOptions,sendEmail,smsConfigured,sendSms}=require('../lib/message-provider.cjs');
const smtp={SMTP_HOST:'smtp.example.test',SMTP_PORT:'587',SMTP_USER:'test',SMTP_PASSWORD:'test-private',SMTP_FROM:'Coonto <sender@example.test>'};
const sms={SMS_ENABLED:'true',SMS_API_TOKEN:'test-private',SMS_COST_CENTRE_ID:'20275'};
test('SMTP exige TLS nas duas portas e rejeita configuração incompleta',()=>{
 assert.equal(smtpOptions(smtp).requireTLS,true);
 assert.equal(smtpOptions({...smtp,SMTP_PORT:'465'}).secure,true);
 assert.throws(()=>smtpOptions({...smtp,SMTP_PASSWORD:''}));
});
test('aceitação SMTP e fechamento do transporte; rejeição não vira sucesso',async()=>{
 let closed=0;
 const mailer={createTransport:()=>({sendMail:async()=>({accepted:['person@example.test']}),close:()=>closed++})};
 await sendEmail('person@example.test','test','test',smtp,mailer);assert.equal(closed,1);
 mailer.createTransport=()=>({sendMail:async()=>({accepted:[]}),close:()=>closed++});
 await assert.rejects(sendEmail('person@example.test','test','test',smtp,mailer));assert.equal(closed,2);
});
test('SMS desligado não pode enviar, mesmo com token',async()=>{
 assert.equal(smsConfigured({...sms,SMS_ENABLED:'false'}),false);
 await assert.rejects(sendSms('5511999999999','test','reference',{...sms,SMS_ENABLED:'false'}));
});
test('MKM recebe JSON do exemplo, Bearer, referência, sem cookie',async()=>{
 await sendSms('5511999999999','test','ref',sms,async(url,options)=>{
  assert.equal(url,'https://sms.mkmservice.com/sms/api/transmission/v1');
  assert.equal(options.headers.Authorization,'Bearer test-private');assert.equal(options.headers.Cookie,undefined);
  assert.equal(options.redirect,'error');
  assert.deepEqual(JSON.parse(options.body),{mailing:{identifier:'Coonto - acesso',cost_centre_id:20275},messages:[{msisdn:'5511999999999',message:'test',reference:'ref'}]});
  return {ok:true,text:async()=>JSON.stringify({success:true})};
 });
});
test('erro HTTP, rejeição explícita ou resposta vazia não são sucesso',async()=>{
 for(const response of [{ok:false,status:401},{ok:true,text:async()=>''},{ok:true,text:async()=>'bad'},{ok:true,text:async()=>'{"success":false}'}])await assert.rejects(sendSms('5511999999999','test','ref',sms,async()=>response));
});
