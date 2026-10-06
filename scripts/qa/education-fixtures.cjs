const {Client}=require('pg');
const {DATASET,assertDev,loadDataset}=require('./education-dataset.cjs');
(async()=>{
 const mode=process.argv[2];if(!['--load','--inspect'].includes(mode))throw Error('Use --load ou --inspect. A carga não redefine dados existentes.');
 assertDev(process.env);if(!process.env.DATABASE_URL)throw Error('DATABASE_URL ausente.');
 const client=new Client({connectionString:process.env.DATABASE_URL});await client.connect();
 try{
  let result;if(mode==='--load')result=await loadDataset(client,process.env);
  else {const exists=await client.query("SELECT to_regclass('coonto_qa_datasets') AS name");if(!exists.rows[0].name){console.log(JSON.stringify({dataset:DATASET,status:'not-loaded'}));return;}const prior=await client.query('SELECT manifest FROM coonto_qa_datasets WHERE key=$1',[DATASET]);if(!prior.rows[0]){console.log(JSON.stringify({dataset:DATASET,status:'not-loaded'}));return;}result={status:'inspected',manifest:prior.rows[0].manifest};}
  const current={};for(const [table,keys] of Object.entries(result.manifest.keys)){const columns=Object.keys(keys[0]),allowed=Object.keys(require('./education-dataset.cjs').makeDataset().tables);if(!allowed.includes(table)||columns.some(c=>!/^[a-z_]+$/.test(c)))throw Error('Manifesto inválido.');const sql='SELECT COUNT(*)::int AS total FROM '+table+' JOIN jsonb_to_recordset($1::jsonb) AS owned('+columns.map(c=>c+' TEXT').join(',')+') USING('+columns.join(',')+')';current[table]=(await client.query(sql,[JSON.stringify(keys)])).rows[0].total;}
  console.log(JSON.stringify({dataset:DATASET,status:result.status,createdAt:result.manifest.createdAt,expected:result.manifest.counts,current}));
 }finally{await client.end();}
})().catch(error=>{console.error('qa_dataset_failed: '+String(error.message).replace(/postgres(?:ql)?:\/\/\S+/g,'[conexão omitida]'));process.exitCode=1;});
