import type {AccessProfile} from '@/lib/access-control';
import type {EducationContext} from '@/lib/education-context';
import type {NetworkContext} from '@/lib/education-network';
export function contextDestinations(profile:AccessProfile,schools:EducationContext[],networks:NetworkContext[]){
 const choices=new Map<string,string>([['reader','/minha-biblioteca']]);
 if(profile.personas.includes('educator')||profile.globalOperation)choices.set('teacher','/professor');
 for(const school of schools)choices.set('school:'+school.id,'/gestao-escolar?instituicao='+encodeURIComponent(school.id));
 for(const network of networks)choices.set('network:'+network.id,'/gestao-rede?rede='+encodeURIComponent(network.id));
 if(profile.canUseCommercialCrm)choices.set('commercial','/parceiro-comercial');
 if(profile.canUseCulturalCrm)choices.set('cultural','/curadoria');return choices;
}
export function rememberedDestination(value:string|undefined,userId:string,choices:Map<string,string>){
 if(!value||value.length>2000)return null;
 try{const saved=JSON.parse(value);return saved.userId===userId&&typeof saved.key==='string'?choices.get(saved.key)??null:null;}catch{return null;}
}
