export const freeWorks=[
 {slug:'o-alienista',title:'O Alienista',author:'Machado de Assis',href:'/leitura/o-alienista',detail:'Experiência completa',art:0},
 {slug:'memorias-de-martha',title:'Memórias de Martha',author:'Júlia Lopes de Almeida',href:'/rc/memorias-de-martha',detail:'12 capítulos · beta em revisão',art:3},
 {slug:'divina-comedia-canto-i',title:'Inferno, Canto I',author:'Dante Alighieri',href:'/rc/divina-comedia-canto-i',detail:'136 versos · beta em revisão',art:15}
] as const;
export function freeWork(slug:string){return freeWorks.find(w=>w.slug===slug);}
