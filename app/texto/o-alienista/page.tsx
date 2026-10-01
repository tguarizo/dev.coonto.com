import { readFile } from "node:fs/promises";
import path from "node:path";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic="force-dynamic";
const numerals=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII"];

export default async function TextoAlienista({searchParams}:{searchParams:Promise<{capitulo?:string}>}) {
  const params=await searchParams;
  const requested=(params.capitulo||"").toUpperCase();
  const focused=numerals.includes(requested)?requested:null;
  const text=await readFile(path.join(process.cwd(),"public","textos","o-alienista-original.txt"),"utf8");
  const sections=text.split(/(?=^CAPÍTULO [IVX]+\s*-)/gm).filter(Boolean);
  const rows=sections.map((section,index)=>({section,numeral:numerals[index]})).filter(row=>!focused||row.numeral===focused);
  return <main className="page"><SiteHeader/><div className="content original-page">
    <section className="page-hero"><span className="section-kicker">{focused?("CAMINHO DO AUTOR · CAPÍTULO "+focused):"TEXTO DE MACHADO DE ASSIS"}</span><h1>O Alienista</h1>
      <p>{focused?"Este é o capítulo relacionado ao ponto que você acabou de explorar no Coonto. Leia procurando a evidência no texto de Machado.":"Leia o texto original e compare cada cena com as palavras do autor. O Coonto apresenta interpretações e situações próprias; elas são identificadas separadamente do texto abaixo."}</p>
      {focused?<div className="after-actions"><a className="button button-outline" href="/texto/o-alienista">Ver texto integral</a><a className="button button-outline" href="/leitura/o-alienista">Voltar à experiência</a></div>:<a className="button button-primary" href="/textos/o-alienista-original.txt" download>Baixar texto integral (.txt)</a>}
    </section>
    {!focused&&<nav className="chapter-nav" aria-label="Capítulos">{numerals.map(n=><a key={n} href={"/texto/o-alienista?capitulo="+n.toLowerCase()+"#capitulo-"+n.toLowerCase()}>Capítulo {n}</a>)}</nav>}
    {rows.map(({section,numeral})=>{
      const [heading,...lines]=section.trim().split("\n");
      return <section key={numeral} id={"capitulo-"+numeral.toLowerCase()} className={"original-chapter"+(focused?" original-chapter-focused":"")}><h2>{heading}</h2><div className="original-text">{lines.join("\n").trim()}</div></section>;
    })}
    {!focused&&<p><a href="/obra/o-alienista">Voltar à experiência Coonto</a></p>}
  </div><SiteFooter/></main>;
}
