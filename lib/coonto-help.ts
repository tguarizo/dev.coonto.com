import type {QueryResultRow} from 'pg';
export const HELP_MODES=['operational','teacher','student'] as const;
export type HelpMode=(typeof HELP_MODES)[number];
export type Answer=QueryResultRow&{id:string;mode:HelpMode;question:string;aliases:string[];answer:string;work_slug:string;scene_id:string;min_index:number;max_index:number;status:string};
export function normalizeQuestion(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function applies(answer:Answer,mode:HelpMode,work:string,scene:string,index:number){return answer.status==='approved'&&answer.mode===mode&&(!answer.work_slug||answer.work_slug===work)&&(!answer.scene_id||answer.scene_id===scene)&&answer.min_index<=index&&answer.max_index>=index;}
export function matchAnswer(answers:Answer[],question:string){const normalized=normalizeQuestion(question);return answers.find(answer=>[answer.question,...answer.aliases].some(alias=>normalizeQuestion(alias)===normalized));}
