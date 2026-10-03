'use server';
import {requireUser} from '@/lib/auth';
import {requireCrmHost} from '@/lib/admin-host';
import {transaction} from '@/lib/transaction';
import {createNetworkContract} from '@/lib/education-licenses';
import {redirect} from 'next/navigation';
import {randomUUID} from 'node:crypto';
async function admin(){await requireCrmHost();const user=await requireUser('/backoffice/redes');if(user.role!=='admin')throw new Error('Acesso negado');return user;}
const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const yes=(form:FormData,key:string)=>form.get(key)==='on';
const done=()=>redirect('/backoffice/redes?salvo=1');
async function audit(client:{query:Function},actor:string,type:string,id:string,metadata:object){await client.query("INSERT INTO crm_events(id,event_type,user_id,related_type,related_id,metadata) VALUES($1,$2,$3,'education_network',$4,$5::jsonb)",[randomUUID(),type,actor,id,JSON.stringify(metadata)]);}
export async function createNetwork(form:FormData){
 const actor=await admin(),name=text(form,'name');if(name.length<2||name.length>200)throw new Error('Nome inválido');
 await transaction(async client=>{const id=randomUUID();await client.query('INSERT INTO education_networks(id,name) VALUES($1,$2)',[id,name]);await audit(client,actor.userId,'education_network_created',id,{name});});done();
}
export async function changeNetworkMember(form:FormData){
 const actor=await admin(),network=text(form,'network'),email=text(form,'email').toLowerCase(),status=text(form,'status');
 if(!network||!email||!['active','revoked'].includes(status))throw new Error('Dados inválidos');
 const licenses=yes(form,'licenses'),reports=yes(form,'reports'),drilldown=yes(form,'drilldown');if(drilldown&&!reports)throw new Error('Detalhamento exige relatórios');
 await transaction(async client=>{
  const account=await client.query<{id:string}>('SELECT id FROM users WHERE email=$1',[email]);if(!account.rows[0])throw new Error('A pessoa precisa entrar no Coonto primeiro');
  const userId=account.rows[0].id;
  await client.query(`INSERT INTO education_network_memberships(network_id,user_id,can_manage_licenses,can_view_reports,can_drilldown,status)
 VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(network_id,user_id) DO UPDATE SET can_manage_licenses=EXCLUDED.can_manage_licenses,can_view_reports=EXCLUDED.can_view_reports,can_drilldown=EXCLUDED.can_drilldown,status=EXCLUDED.status,valid_from=NOW(),valid_until=NULL`,[network,userId,licenses,reports,drilldown,status]);
  await audit(client,actor.userId,'education_network_member_changed',network,{userId,licenses,reports,drilldown,status});
 });done();
}
export async function changeNetworkSchool(form:FormData){
 const actor=await admin(),network=text(form,'network'),school=text(form,'school'),status=text(form,'status');
 if(!network||!school||!['active','revoked'].includes(status))throw new Error('Dados inválidos');
 await transaction(async client=>{
  const found=await client.query("SELECT id FROM organizations WHERE id=$1 AND kind IN ('school','course')",[school]);if(!found.rows[0])throw new Error('Escola inválida');
  await client.query(`INSERT INTO education_network_schools(network_id,organization_id,can_allocate_licenses,can_share_reports,status)
 VALUES($1,$2,$3,$4,$5) ON CONFLICT(network_id,organization_id) DO UPDATE SET can_allocate_licenses=EXCLUDED.can_allocate_licenses,can_share_reports=EXCLUDED.can_share_reports,status=EXCLUDED.status,valid_from=NOW(),valid_until=NULL`,[network,school,yes(form,'licenses'),yes(form,'reports'),status]);
  await audit(client,actor.userId,'education_network_school_changed',network,{school,licenses:yes(form,'licenses'),reports:yes(form,'reports'),status});
 });done();
}
function date(value:string,end=false){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return new Date(NaN);
 const date=new Date(value+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)return new Date(NaN);
 return new Date(new Date(value+'T00:00:00-03:00').getTime()+(end?86400000:0));
}
export async function registerContract(form:FormData){
 const actor=await admin(),raw=text(form,'seats');
 const ok=/^\d+$/.test(raw)&&await createNetworkContract(actor.userId,text(form,'network'),text(form,'reference'),text(form,'work'),Number(raw),date(text(form,'from')),date(text(form,'until'),true));
 if(!ok)throw new Error('Confira os dados do contrato');done();
}
export async function revokeContract(form:FormData){
 const actor=await admin(),id=text(form,'contract');
 await transaction(async client=>{
  const found=await client.query('SELECT id FROM education_license_contracts WHERE id=$1 FOR UPDATE',[id]);if(!found.rows[0])throw new Error('Contrato inválido');
  await client.query("UPDATE education_license_contracts SET status='revoked' WHERE id=$1",[id]);
  await audit(client,actor.userId,'education_contract_revoked',id,{});
 });done();
}
