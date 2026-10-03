import {notFound,redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {requireEducationVerification} from '@/lib/education-session';
import {networkContexts,networkSchools} from '@/lib/education-network';
import {networkContracts} from '@/lib/education-licenses';
import {networkReport,networkSchoolTeachers,networkSchoolClasses,reportWindow} from '@/lib/education-reports';
import {EducationSidebar} from '@/components/education-sidebar';
import {EducationReportSummary} from '@/components/education-report';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
import {allocateLicenses} from './actions';
import '../backoffice/crm/styles.css';
export const dynamic='force-dynamic';
export default async function GestaoRede({searchParams}:{searchParams:Promise<{rede?:string;escola?:string;professor?:string;turma?:string;de?:string;ate?:string;resultado?:string}>}){
 const user=await requireUser('/gestao-rede'),raw=await searchParams,params={...raw,professor:raw.professor||undefined},contexts=await networkContexts(user.userId);
 const context=params.rede!==undefined?contexts.find(n=>n.id===params.rede):contexts.length===1?contexts[0]:undefined;
 if(!context){if(params.rede!==undefined)notFound();redirect('/ambientes');}
 const base='/gestao-rede?rede='+encodeURIComponent(context.id);requireEducationVerification(user,base);
 const window=reportWindow(params.de,params.ate);if(!window)notFound();
 const schools=await networkSchools(user.userId,context.id);
 const selected=params.escola!==undefined?schools.rows.find(o=>o.id===params.escola&&o.can_share_reports):undefined;
 if(params.escola!==undefined&&(!context.can_drilldown||!selected))notFound();
 if((params.professor!==undefined||params.turma!==undefined)&&!selected)notFound();
 const teachers=selected?await networkSchoolTeachers(user.userId,context.id,selected.id):{rows:[]};
 if(params.professor!==undefined&&!teachers.rows.some(t=>t.id===params.professor))notFound();
 const classes=selected?await networkSchoolClasses(user.userId,context.id,selected.id,params.professor):{rows:[]};
 if(params.turma!==undefined&&!classes.rows.some(c=>c.id===params.turma))notFound();
 const report=context.can_view_reports?await networkReport(user.userId,context.id,window,selected?.id,params.professor,params.turma):null;
 const contracts=context.can_manage_licenses?await networkContracts(user.userId,context.id):{rows:[]};
 const reportQuery=`&de=${window.from}&ate=${window.until}`;
 return <div className="crm-workspace"><EducationSidebar name={context.name} environment="Rede" home={base}/><div className="crm-workspace-main"><main className="page"><SiteHeader/><div className="content member-page"><section className="page-hero"><span className="section-kicker">COONTO REDE</span><h1>{context.name}</h1><p>Escolas vinculadas e permissões independentes para licenças e acompanhamento pedagógico.</p></section>
 {params.resultado&&<p role="status">{params.resultado==='salvo'?'Distribuição salva.':'Não foi possível distribuir. Confira o vínculo, a vigência e as vagas disponíveis.'}</p>}
 {context.can_view_reports&&<><form method="get" className="dashboard-card crm-inline-form"><input type="hidden" name="rede" value={context.id}/>{selected&&<input type="hidden" name="escola" value={selected.id}/>}<label className="field">De<input type="date" name="de" required defaultValue={window.from}/></label><label className="field">Até<input type="date" name="ate" required defaultValue={window.until}/></label><button className="button button-primary">Filtrar período</button></form>
 {selected&&<section className="dashboard-card"><h2>{selected.name}</h2><form method="get" className="crm-inline-form"><input type="hidden" name="rede" value={context.id}/><input type="hidden" name="escola" value={selected.id}/><input type="hidden" name="de" value={window.from}/><input type="hidden" name="ate" value={window.until}/><label className="field">Professor<select name="professor" defaultValue={params.professor??''}><option value="">Todos</option>{teachers.rows.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><button className="button">Filtrar professor</button></form><p>O recorte do professor considera as turmas atualmente atribuídas nesta escola e pode incluir trabalho de outros docentes da mesma turma.</p><div className="status-list">{classes.rows.map(c=><a key={c.id} href={`${base}${reportQuery}&escola=${encodeURIComponent(selected.id)}${params.professor?'&professor='+encodeURIComponent(params.professor):''}&turma=${encodeURIComponent(c.id)}`}>{c.name}</a>)}</div><a href={base+reportQuery}>Voltar ao geral da rede</a></section>}
 {report&&<EducationReportSummary report={report}/>}</>}
 <section className="dashboard-card"><h2>Escolas autorizadas</h2>{schools.rows.map(o=><div className="status-item" key={o.id}><div><strong>{o.name}</strong><p>{o.can_share_reports?'Relatórios autorizados':'Sem acesso pedagógico'} · {o.can_allocate_licenses?'Licenças autorizadas':'Sem distribuição de licenças'}</p></div>{context.can_drilldown&&o.can_share_reports&&<a href={`${base}${reportQuery}&escola=${encodeURIComponent(o.id)}`}>Detalhar escola</a>}{o.can_allocate_licenses&&<a href={`/licencas-institucionais?instituicao=${encodeURIComponent(o.id)}`}>Atribuir licenças</a>}</div>)}{!schools.rows.length&&<p>Nenhuma escola autorizada neste contexto.</p>}</section>
 {context.can_manage_licenses&&<section className="dashboard-card"><h2>Contratos e distribuição</h2><p>Contratada é a capacidade do contrato; distribuída é a capacidade reservada às escolas; atribuída é a licença concedida ao aluno. Ativada registra a autorização para download ou acesso ao conteúdo; conteúdo acessado registra a entrega do conteúdo pelo servidor, incluindo download. Não são medidas de aprendizagem.</p>{contracts.rows.map(k=><article key={k.id}><h3>{k.reference} · {k.work_slug}</h3><p>{k.seats} contratada(s) · {k.allocated} distribuída(s) · {k.assigned} atribuída(s) · {k.activated} ativada(s) · {k.used} com conteúdo acessado</p><p>Vigência: {new Date(k.valid_from).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})} a {new Date(new Date(k.valid_until).getTime()-1).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})} · {k.status==='revoked'?'Contrato revogado':new Date(k.valid_until).getTime()<=Date.now()?'Vigência encerrada':new Date(k.valid_from).getTime()>Date.now()?'Vigência futura':'Contrato vigente'}</p><form action={allocateLicenses} className="crm-inline-form"><input type="hidden" name="network" value={context.id}/><input type="hidden" name="contract" value={k.id}/><label className="field">Escola<select name="school" required><option value="">Selecione</option>{schools.rows.filter(o=>o.can_allocate_licenses).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label><label className="field">Total reservado para a escola<input type="number" name="seats" required min={0} max={k.seats}/></label><button className="button button-primary">Definir reserva</button></form></article>)}{!contracts.rows.length&&<p>Nenhum contrato registrado. O Coonto Administração cadastra os contratos confirmados.</p>}</section>}
 </div><SiteFooter/></main></div></div>;
}
