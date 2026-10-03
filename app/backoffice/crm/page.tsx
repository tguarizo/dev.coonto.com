import "./styles.css";
import { requireUser } from "@/lib/auth";
import { requireCrmHost } from "@/lib/admin-host";
import { query } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { changeMembershipAccess, addMember, assignLicense, assignTeacher, createClassroom, createOrganization, enrollStudent, removeFromClassroom, revokeLicense, setSeats, updateLead } from "./actions";

export const dynamic = "force-dynamic";

type Organization = { id: string; name: string; kind: string; seats: number | null; used: string };
type Member = { organization_id: string; user_id: string; role: string; status:string; name: string; email: string; licensed: boolean };
type Classroom = { id: string; organization_id: string; name: string; student_count: string };
type ClassroomMember = { organization_id: string; classroom_id: string; user_id: string; name: string };
type Lead = { id: string; name: string; email: string; role: string; organization: string | null; message: string; status: string; created_at: Date };
type Student = { id: string; name: string; email: string; last_seen_at: Date; progress: string; school_count: string };

export default async function CRM({ searchParams }: { searchParams: Promise<{ salvo?: string; area?: string; busca?: string }> }) {
  await requireCrmHost();
  const user = await requireUser("/backoffice/crm");
  if (user.role !== "admin") return <main className="page"><SiteHeader/><div className="content page-hero"><h1>Área restrita</h1></div></main>;
  const params = await searchParams;
  const area = ["relacionamentos", "alunos", "organizacoes"].includes(params.area || "") ? params.area : "relacionamentos";
  const search = (params.busca || "").trim().slice(0, 120);
  const titles: Record<string,string> = { relacionamentos: "Contatos e parceiros", alunos: "Alunos e contas", organizacoes: "Escolas e turmas" };
  const [organizations, memberships, classrooms, leads, students, classroomTeachers, classroomStudents] = await Promise.all([
    query<Organization>(`SELECT o.id,o.name,o.kind,p.seats,
      (SELECT COUNT(*)::text FROM license_assignments a WHERE a.organization_id=o.id AND a.work_slug='o-alienista' AND a.status='active') AS used
      FROM organizations o LEFT JOIN license_pools p ON p.organization_id=o.id AND p.work_slug='o-alienista'
      WHERE ($1::text='' OR o.name ILIKE '%' || $1 || '%') ORDER BY o.name`, [area === "organizacoes" ? search : ""]),
    query<Member>(`SELECT m.organization_id,m.user_id,m.role,m.status,u.name,u.email,
      EXISTS(SELECT 1 FROM license_assignments a WHERE a.organization_id=m.organization_id AND a.user_id=m.user_id AND a.work_slug='o-alienista' AND a.status='active') AS licensed
      FROM organization_memberships m JOIN users u ON u.id=m.user_id ORDER BY u.name`),
    query<Classroom>(`SELECT c.id,c.organization_id,c.name,COUNT(e.user_id)::text AS student_count
      FROM classrooms c LEFT JOIN classroom_enrollments e ON e.classroom_id=c.id GROUP BY c.id ORDER BY c.name`),
    query<Lead>(`SELECT id,name,email,role,organization,message,status,created_at FROM partner_leads
      WHERE ($1::text='' OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%'
        OR organization ILIKE '%' || $1 || '%' OR message ILIKE '%' || $1 || '%')
      ORDER BY created_at DESC LIMIT 100`, [area === "relacionamentos" ? search : ""]),
    query<Student>(`SELECT u.id,u.name,u.email,u.last_seen_at,
      (SELECT COUNT(*)::text FROM learning_progress p WHERE p.user_id=u.id) AS progress,
      (SELECT COUNT(*)::text FROM organization_memberships m WHERE m.user_id=u.id AND m.role='student') AS school_count
      FROM users u WHERE ($1::text='' OR u.name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
      ORDER BY u.last_seen_at DESC LIMIT 100`, [area === "alunos" ? search : ""]),
    query<ClassroomMember>("SELECT t.organization_id,t.classroom_id,t.user_id,u.name FROM classroom_teachers t JOIN users u ON u.id=t.user_id ORDER BY u.name"),
    query<ClassroomMember>("SELECT e.organization_id,e.classroom_id,e.user_id,u.name FROM classroom_enrollments e JOIN users u ON u.id=e.user_id ORDER BY u.name"),
  ]);
  const saved = params.salvo === "1";
  return <main className="backoffice"><SiteHeader/><div className="content crm-page">
    <section className="backoffice-hero"><span className="section-kicker">CRM · PESSOAS E ORGANIZAÇÕES</span><h1>{titles[area!]}</h1><p>Selecione a área no menu à esquerda e encontre o registro pelo nome, e-mail ou assunto.</p>{saved && <p role="status">Alteração salva.</p>}</section>
    <form method="get" className="dashboard-card crm-search" role="search"><input type="hidden" name="area" value={area}/><label className="field">Buscar nesta área<input type="search" name="busca" defaultValue={search} maxLength={120} placeholder={area === "organizacoes" ? "Nome da escola ou organização" : "Nome, e-mail ou palavra"}/></label><button className="button button-primary">Pesquisar</button>{search && <a href={`/backoffice/crm?area=${area}`}>Limpar busca</a>}</form>
    {area === "relacionamentos" && <section id="relacionamentos" className="dashboard-card"><h2>Professores, curadores e parceiros</h2><p>Contatos recebidos pelo formulário de parcerias. Até 100 resultados por busca.</p>
      {leads.rows.length ? <div className="status-list">{leads.rows.map(lead => <article className="status-item" key={lead.id}><div><strong>{lead.name}</strong> · {lead.role}{lead.organization && <> · {lead.organization}</>}<p><a href={`mailto:${lead.email}`}>{lead.email}</a> · {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p><p>{lead.message}</p></div><form action={updateLead}><input type="hidden" name="id" value={lead.id}/><label className="field">Etapa<select name="status" defaultValue={lead.status}><option value="new">Novo</option><option value="contacted">Contatado</option><option value="qualified">Qualificado</option><option value="closed">Encerrado</option></select></label><button className="button button-primary">Salvar</button></form></article>)}</div> : <p>Nenhum contato encontrado.</p>}</section>}
    {area === "alunos" && <section id="alunos" className="dashboard-card"><h2>Alunos e contas</h2><p>Até 100 contas com atividade recente. O mesmo aluno pode participar de mais de uma organização, mantendo uma única identidade e progresso.</p>
      <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Experiências</th><th>Escolas</th><th>Última atividade</th></tr></thead><tbody>{students.rows.map(student => <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td>{student.progress}</td><td>{student.school_count}</td><td>{new Date(student.last_seen_at).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div></section>}
    {area === "organizacoes" && <section id="organizacoes" className="dashboard-card"><h2>Escolas e organizações</h2><form action={createOrganization} className="crm-inline-form"><label className="field">Nome<input name="name" required maxLength={200}/></label><label className="field">Tipo<select name="kind"><option value="school">Escola</option><option value="course">Cursinho</option><option value="partner">Parceiro</option></select></label><button className="button button-primary">Criar organização</button></form></section>}
    {area === "organizacoes" && organizations.rows.map(org => {
      const members = memberships.rows.filter(m => m.organization_id === org.id);
      const classes = classrooms.rows.filter(c => c.organization_id === org.id);
      const studentsInOrg = members.filter(m => m.role === "student" && m.status === "active");
      const teachersInOrg = members.filter(m => m.role === "teacher" && m.status === "active");
      return <section className="dashboard-card" key={org.id}><h2>{org.name}</h2><p>{org.kind} · {members.length} pessoa(s) · O Alienista: {org.used}/{org.seats ?? 0} vaga(s) em uso</p>
        <div className="crm-form-grid"><form action={addMember} className="form-card"><h3>Vincular pessoa</h3><input type="hidden" name="organization_id" value={org.id}/><label className="field">E-mail da conta<input name="email" type="email" required/></label><label className="field">Função<select name="role"><option value="student">Aluno</option><option value="teacher">Professor</option><option value="manager">Gestor</option></select></label><button className="button button-primary">Vincular</button></form>
          <form action={createClassroom} className="form-card"><h3>Nova turma</h3><input type="hidden" name="organization_id" value={org.id}/><label className="field">Nome da turma<input name="name" required/></label><button className="button button-primary">Criar turma</button></form>
          <form action={setSeats} className="form-card"><h3>Licenças de O Alienista</h3><input type="hidden" name="organization_id" value={org.id}/><label className="field">Vagas contratadas ou de piloto<input name="seats" type="number" min={org.used} max="100000" defaultValue={org.seats ?? 0} required/></label><button className="button button-primary">Salvar vagas</button></form></div>
        <h3>Pessoas vinculadas</h3>{members.length ? <div className="status-list">{members.map(member => <div className="status-item" key={member.user_id}><div><strong>{member.name}</strong> · {member.role}<br/><small>{member.email} · {member.status==="active"?"Vínculo ativo":"Acesso revogado"}</small></div><form action={changeMembershipAccess}><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="user_id" value={member.user_id}/><input type="hidden" name="status" value={member.status==="active"?"revoked":"active"}/><button className="button">{member.status==="active"?"Revogar acesso institucional":"Reativar acesso institucional"}</button></form>{member.role === "student" && (member.status === "active" || member.licensed) && <form action={member.licensed ? revokeLicense : assignLicense}><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="user_id" value={member.user_id}/><button className="button button-primary">{member.licensed ? "Revogar licença" : "Atribuir licença"}</button></form>}</div>)}</div> : <p>Nenhuma pessoa vinculada.</p>}
        <h3>Turmas</h3>{classes.length ? classes.map(classroom => <div className="status-item" key={classroom.id}><div><strong>{classroom.name}</strong> · {classroom.student_count} aluno(s)<div className="crm-class-members"><strong>Professores</strong>{classroomTeachers.rows.filter(t => t.classroom_id === classroom.id).map(person => <form action={removeFromClassroom} key={person.user_id}><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="classroom_id" value={classroom.id}/><input type="hidden" name="user_id" value={person.user_id}/><input type="hidden" name="role" value="teacher"/>{person.name} <button type="submit">Remover</button></form>)}</div><div className="crm-class-members"><strong>Alunos</strong>{classroomStudents.rows.filter(t => t.classroom_id === classroom.id).map(person => <form action={removeFromClassroom} key={person.user_id}><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="classroom_id" value={classroom.id}/><input type="hidden" name="user_id" value={person.user_id}/><input type="hidden" name="role" value="student"/>{person.name} <button type="submit">Remover</button></form>)}</div></div><div><form action={enrollStudent} className="crm-inline-form"><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="classroom_id" value={classroom.id}/><label className="field">Adicionar aluno<select name="user_id" required defaultValue=""><option value="" disabled>Selecione</option>{studentsInOrg.map(student => <option key={student.user_id} value={student.user_id}>{student.name} · {student.email}</option>)}</select></label><button className="button button-primary" disabled={!studentsInOrg.length}>Adicionar</button></form><form action={assignTeacher} className="crm-inline-form"><input type="hidden" name="organization_id" value={org.id}/><input type="hidden" name="classroom_id" value={classroom.id}/><label className="field">Vincular professor<select name="user_id" required defaultValue=""><option value="" disabled>Selecione</option>{teachersInOrg.map(teacher => <option key={teacher.user_id} value={teacher.user_id}>{teacher.name} · {teacher.email}</option>)}</select></label><button className="button button-primary" disabled={!teachersInOrg.length}>Vincular</button></form></div></div>) : <p>Nenhuma turma criada.</p>}
      </section>;
    })}
  </div></main>;
}
