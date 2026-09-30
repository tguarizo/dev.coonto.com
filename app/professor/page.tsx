import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TeacherWorkspace } from "@/components/teacher-workspace";
import { ensureAlienistaEntitlement } from "@/lib/member";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function Professor() {
  const user = await requireUser("/professor");
  if(user.accountKind==='guest'&&user.role!=='admin')return <main className="page"><SiteHeader/><div className="content member-page"><h1>Seu acesso Guest está pronto.</h1><p>O espaço do professor precisa de um vínculo de educador aprovado. Enquanto isso, explore a experiência gratuita.</p><a href="/minha-biblioteca">Ir para minha biblioteca</a></div><SiteFooter/></main>;
  if (!await ensureAlienistaEntitlement(user.userId)) redirect("/checkout/o-alienista?return_to=%2Fprofessor");
  // A área docente é autodeclarada; futuramente escolas podem verificar seus docentes.
  await query("INSERT INTO teacher_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [user.userId]);
  return <main className="page"><SiteHeader/><div className="content member-page">
    <section className="page-hero"><span className="section-kicker">ESPAÇO DO PROFESSOR</span><h1>Prepare a aula sem perder o caminho.</h1>
      <p>Abra uma cena para discussão e marque os pontos que usará depois. Este percurso de preparação não altera o progresso dos alunos.</p></section>
    <TeacherWorkspace/>
  </div><SiteFooter/></main>;
}
