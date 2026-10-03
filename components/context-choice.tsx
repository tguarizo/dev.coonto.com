import {chooseContext} from '@/app/ambientes/actions';
export function ContextChoice({context,label}:{context:string;label:string}){
 return <form action={chooseContext}><input type="hidden" name="context" value={context}/><label><input name="remember" type="checkbox"/> Usar este ambiente nas próximas entradas</label><p><button className="button button-primary" type="submit">{label}</button></p></form>;
}
