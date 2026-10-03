import { requireUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TeacherWorkspace } from "@/components/teacher-workspace";
import { getAccessProfile } from "@/lib/access-control";

export const dynamic = "force-dynamic";
export default async function Professor() {
  const user = await requireUser("/professor");
  const access = await getAccessProfile(user);
  const educator = access.globalOperation || access.personas.includes("educator");
  if (!educator) return <main className="page"><SiteHeader/><div className="content member-page">
    <section className="page-hero"><span className="section-kicker">COONTO EDUCAÇÃO · PAINEL DO PROFESSOR</span><h1>Acesso Educador necessário.</h1>
      <p>O espaço do professor é reservado a educadores verificados. Seu acesso de leitura continua disponível normalmente.</p>
      <a className="button button-primary" href="/minha-biblioteca">Ir para minha biblioteca</a></section>
  </div><SiteFooter/></main>;
  return <main className="page"><SiteHeader/><div className="content member-page">
    <section className="page-hero"><span className="section-kicker">COONTO EDUCAÇÃO · PAINEL DO PROFESSOR</span><h1>Prepare a aula sem perder o caminho.</h1>
      <p>Como educador verificado, você pode preparar e demonstrar as experiências disponíveis. Suas marcações de aula não alteram o progresso dos alunos.</p></section>
    <a className="button button-primary" href="/gestao-escolar">Minhas turmas e atividades</a>
    <TeacherWorkspace/>
  </div><SiteFooter/></main>;
}
