import {RcLiteraryExperience} from "@/components/rc-literary-experience";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export const dynamic="force-dynamic";

const steps=[
  {stage:"SE SITUANDO",title:"Uma memória que começa pela perda",body:"Martha narra a própria infância em primeira pessoa. A lembrança do pai morto, da mudança e da queda material da família aparece fragmentada, como memória infantil.",sourceHref:"https://digital.bbm.usp.br/handle/bbm/7037",sourceLabel:"Ver edição de 1899 na BBM"},
  {stage:"OBSERVANDO",title:"A vida muda de cenário",body:"Martha e a mãe passam a viver num cortiço em São Cristóvão. O espaço, o trabalho da mãe e a vulnerabilidade da infância deixam de ser fundo e passam a organizar a experiência da narradora.",question:"O que merece mais atenção nesta mudança?",options:["A pobreza como cenário decorativo.","Como espaço social, trabalho e gênero moldam a vida de Martha.","Apenas a mudança física de endereço."],response:"Aqui não interessa marcar uma leitura como secreta ou definitiva. A questão é observar qual hipótese permite voltar ao texto e enxergar mais relações."},
  {stage:"DECIDINDO",title:"Que hipótese você levaria para a leitura?",body:"Antes de seguir, escolha uma hipótese de leitura para testar no texto.",question:"Qual hipótese você gostaria de investigar?",options:["A educação aparece como possibilidade de mudança na vida de Martha.","A memória da infância serve apenas para criar nostalgia.","O cortiço não interfere na formação da personagem."],response:"Sua escolha não é tratada como certa ou errada. Ela vira uma pergunta que você precisa conferir na obra."},
  {stage:"CONFERINDO NO TEXTO",title:"Volte à obra",body:"Procure passagens sobre o trabalho da mãe, a experiência no cortiço e a formação de Martha. Tente encontrar uma evidência que sustente sua hipótese e outra que a complique.",sourceHref:"https://digital.bbm.usp.br/handle/bbm/7037",sourceLabel:"Conferir na edição original"},
  {stage:"CONECTANDO",title:"Da experiência individual ao mundo social",body:"A trajetória de Martha permite relacionar memória, pobreza, trabalho feminino, educação e independência. O desafio é explicar essas relações sem reduzir a obra a uma única tese.",question:"Depois de conferir o texto, o que você faria com sua hipótese inicial?",options:["Manteria igual, sem revisar.","Ajustaria conforme as evidências encontradas.","Abandonaria qualquer interpretação."],response:"No Coonto, uma boa leitura não termina na primeira resposta: ela pode ser sustentada, complicada ou revista pelo texto."},
  {stage:"RECUPERANDO",title:"Tente explicar sem olhar",body:"Em duas ou três frases, tente explicar por que a memória de Martha não é apenas pessoal, mas também social. Depois volte ao texto e veja o que esqueceu ou simplificou."}
];

export default function MemoriasDeMarthaRc(){
  return <main className="page"><SiteHeader/><div className="content member-page">
    <RcLiteraryExperience title="Memórias de Martha" author="Júlia Lopes de Almeida · FUVEST 2027" intro="Protótipo editorial da segunda obra do RC. A experiência será expandida a partir da edição de 1899 da Biblioteca Brasiliana, mantendo o texto original como referência." steps={steps}/>
  </div><SiteFooter/></main>;
}
