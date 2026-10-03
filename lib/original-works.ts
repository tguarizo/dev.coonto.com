// O livro original é independente do acesso/licença da experiência Coonto.
export const originalWorks = [
  { slug: 'o-alienista', title: 'O Alienista', author: 'Machado de Assis', href: '/textos/o-alienista-original.txt', label: 'Baixar texto completo · TXT', external: false, source: 'Texto de Machado de Assis, separado das atividades do Coonto.' },
  { slug: 'memorias-de-martha', title: 'Memórias de Martha', author: 'Júlia Lopes de Almeida', href: '/textos/memorias-de-martha-original.pdf', label: 'Baixar livro original · PDF', external: false, source: 'Fac-símile de 1899 da BBM/USP. O volume inclui textos anexos que não são capítulos do romance.' },
  { slug: 'divina-comedia-canto-i', title: 'A Divina Comédia', author: 'Dante Alighieri', href: 'https://www.ebooksbrasil.org/adobeebook/divinacomedia.pdf', label: 'Abrir PDF completo na fonte', external: true, source: 'Tradução de José Pedro Xavier Pinheiro, edição eBooksBrasil. Inferno, Purgatório e Paraíso. Edição distinta da transcrição do Canto I usada no Coonto; respeite as condições indicadas no arquivo.' },
] as const;
export function originalWork(slug: string) { return originalWorks.find(work => work.slug === slug); }
