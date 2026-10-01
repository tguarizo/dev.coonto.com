export const COONTO_LEARNING_FLOW = [
  { id:"situar", label:"Situando", purpose:"Entender onde você está na obra e por que este momento importa." },
  { id:"observar", label:"Observando", purpose:"Perceber acontecimentos, pistas e mudanças relevantes." },
  { id:"decidir", label:"Decidindo", purpose:"Tomar posição antes de conhecer o caminho seguido pelo autor." },
  { id:"descobrir", label:"Descobrindo", purpose:"Ver consequências e comparar sua escolha com a narrativa original." },
  { id:"comprovar", label:"Comprovando no texto", purpose:"Encontrar na obra a evidência que sustenta a leitura." },
  { id:"entender", label:"Entendendo", purpose:"Explicar por que aquele momento é importante." },
  { id:"conectar", label:"Conectando", purpose:"Relacionar esta cena ao que veio antes e aos temas maiores da obra." },
  { id:"recuperar", label:"Recuperando", purpose:"Tentar explicar sem reler para fortalecer a memória." },
] as const;

export type CoontoLearningStage = typeof COONTO_LEARNING_FLOW[number]["id"];

export function learningStageForScene(scene:{type?:string;eyebrow?:string}):CoontoLearningStage{
  const eyebrow=(scene.eyebrow||"").toLowerCase();
  if(scene.type==="intro"||scene.type==="phase")return "situar";
  if(scene.type==="checkpoint"||scene.type==="challenge")return "recuperar";
  if(eyebrow.includes("observar"))return "observar";
  if(eyebrow.includes("provar")||eyebrow.includes("evid"))return "comprovar";
  if(eyebrow.includes("conectar"))return "conectar";
  if(scene.type==="choice")return "decidir";
  return "entender";
}
