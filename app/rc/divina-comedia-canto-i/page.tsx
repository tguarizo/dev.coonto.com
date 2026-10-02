import {RcLiteraryExperience} from "@/components/rc-literary-experience";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export const dynamic="force-dynamic";

const source="https://pt.wikisource.org/wiki/A_Divina_Com%C3%A9dia_%28Xavier_Pinheiro%29/grafia_atualizada/Inferno/I";
const steps=[
  {stage:"SE SITUANDO",title:"Uma selva escura",body:"No Canto I do Inferno, Dante se apresenta perdido e fora do caminho. A travessia começa antes de qualquer explicação sobre o além: começa com desorientação.",sourceHref:source,sourceLabel:"Ler o Canto I"},
  {stage:"OBSERVANDO",title:"O caminho não se abre sozinho",body:"Ao tentar sair, Dante encontra obstáculos que o fazem recuar. O movimento físico da cena também cria uma pergunta interpretativa: o que impede alguém de avançar quando já percebe que está perdido?",question:"O que você observaria primeiro?",options:["Apenas quais animais aparecem.","A relação entre medo, recuo e dificuldade de encontrar direção.","Somente a paisagem."],response:"A escolha serve para orientar sua atenção. Depois, o texto precisa sustentar ou complicar aquilo que você percebeu."},
  {stage:"DECIDINDO",title:"Aceitar ou não um guia",body:"Virgílio surge quando Dante não consegue avançar sozinho.",question:"Se você estivesse nessa situação, o que faria?",options:["Tentaria seguir sozinho.","Aceitaria a orientação do guia.","Voltaria para a selva e esperaria."],response:"Não há certo ou errado na sua decisão pessoal. O próximo passo é descobrir o que Dante faz e por quê."},
  {stage:"DESCOBRINDO",title:"Dante aceita seguir",body:"Virgílio oferece uma rota que passa por Inferno e Purgatório antes que outra guia conduza Dante adiante. A decisão transforma a desorientação inicial em jornada.",sourceHref:source,sourceLabel:"Conferir no Canto I"},
  {stage:"CONFERINDO NO TEXTO",title:"Procure a evidência",body:"Volte ao Canto I e localize o momento em que Virgílio se apresenta e propõe o percurso. Observe o que Dante pergunta, teme e aceita.",sourceHref:source,sourceLabel:"Abrir texto de Xavier Pinheiro"},
  {stage:"RECUPERANDO",title:"Explique o início da jornada",body:"Sem reler, tente responder: por que o encontro com Virgílio muda a situação de Dante? Depois volte ao texto e revise sua resposta."}
];

export default function DivinaCantoIRc(){
  return <main className="page"><SiteHeader/><div className="content member-page">
    <RcLiteraryExperience title="A Divina Comédia · Inferno, Canto I" author="Dante Alighieri · tradução de José Pedro Xavier Pinheiro" intro="Percurso inicial em revisão editorial. Leia o canto completo pelo link do texto original e teste a experiência com Dante." steps={steps}/>
  </div><SiteFooter/></main>;
}
