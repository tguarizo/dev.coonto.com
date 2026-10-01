// P0 live email retest 2026-10-01 12:02
// P0 diagnostic 2026-10-01
// Diagnóstico somente de leitura. Nunca imprime chaves, códigos, corpos ou destinatários.
let nodemailer;try{nodemailer=require('nodemailer');}catch{}
const {Pool}=require('pg');
const emit=(kind,data)=>console.log(JSON.stringify({kind,...data}));
(async()=>{
 const env=process.env,host=env.SMTP_HOST||'',port=Number(env.SMTP_PORT||587);
 emit('configuration',{authMode:env.AUTH_MODE||'unset',smtpConfigured:Boolean(host&&env.SMTP_USER&&env.SMTP_PASSWORD&&env.SMTP_FROM),senderDomain:(env.SMTP_FROM||'').match(/@([^>\s]+)/)?.[1]||'unset'});
 if(env.DATABASE_URL){const pool=new Pool({connectionString:env.DATABASE_URL,connectionTimeoutMillis:5000});try{const counts=await pool.query("SELECT COUNT(*)::int AS requests,COUNT(*) FILTER(WHERE used_at IS NOT NULL)::int AS used,MAX(created_at) AS latest FROM login_codes WHERE created_at>NOW()-INTERVAL '3 hours'");emit('recent_requests',counts.rows[0]);}catch{emit('recent_requests',{available:false});}finally{await pool.end();}}
 if(env.AUTH_MODE==='validation'){emit('result',{status:'validation_mode_no_email'});return;}
 if(!host||!env.SMTP_USER||!env.SMTP_PASSWORD||!env.SMTP_FROM){emit('result',{status:'smtp_configuration_missing'});return;}
 if(!nodemailer)emit('smtp',{status:'cli_library_unavailable'});
 const transporter=nodemailer?.createTransport({host,port,secure:port===465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
 if(transporter)try{await transporter.verify();emit('smtp',{status:'connection_and_authentication_ok'});}catch(error){emit('smtp',{status:'failed',code:error.code||'unknown',responseCode:error.responseCode||null,command:error.command||null});}finally{transporter.close();}
 if(host.toLowerCase()==='smtp.resend.com'){
  const response=await fetch('https://api.resend.com/emails?limit=100',{headers:{Authorization:'Bearer '+env.SMTP_PASSWORD},signal:AbortSignal.timeout(15000)});
  if(!response.ok){emit('delivery_history',{available:false,httpStatus:response.status});return;}
  const result=await response.json();const domain=(env.SMTP_FROM||'').match(/@([^>\s]+)/)?.[1]?.toLowerCase();
  const recent=(result.data||[]).filter(item=>Date.parse(item.created_at)>Date.now()-3*3600000&&(!domain||String(item.from||'').toLowerCase().includes('@'+domain)));
  emit('delivery_history',{available:true,events:recent.slice(0,20).map(item=>({at:item.created_at,status:item.last_event||'unknown'}))});
 }
})().catch(()=>{emit('result',{status:'diagnostic_incomplete'});process.exitCode=1;});
