import { getCurrentUser } from "@/lib/auth";
import { getAccessProfile } from "@/lib/access-control";
import { query } from "@/lib/db";
import { ALIENISTA } from "@/lib/works";
import scenes from "@/content/o-alienista-scenes.json";

async function teacher() {
  const user = await getCurrentUser();
  if (!user) return null;
  const access=await getAccessProfile(user);
  if(!access.globalOperation&&!access.personas.includes("educator"))return null;
  await query("INSERT INTO teacher_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING",[user.userId]);
  return user;
}

export async function GET() {
  const user = await teacher();if (!user) return Response.json({ error: "Acesse seu espaço de professor" }, { status: 403 });
  const result = await query<{id:string;scene_id:string;title:string}>("SELECT id,scene_id,title FROM teacher_bookmarks WHERE user_id=$1 AND work_slug=$2 ORDER BY created_at DESC", [user.userId, ALIENISTA.slug]);
  return Response.json({ bookmarks: result.rows });
}
export async function POST(request: Request) {
  const user = await teacher();if (!user) return Response.json({ error: "Acesso restrito" }, { status: 403 });
  const body = await request.json() as { sceneId?:string; title?:string };const sceneId = String(body.sceneId || "");const title = String(body.title || "").trim();
  if (!scenes.some(scene => scene.id === sceneId) || !title || title.length > 100) return Response.json({ error: "Informe uma cena e um nome de até 100 caracteres" }, { status: 400 });
  const id = crypto.randomUUID();await query("INSERT INTO teacher_bookmarks (id,user_id,work_slug,scene_id,title) VALUES ($1,$2,$3,$4,$5)",[id,user.userId,ALIENISTA.slug,sceneId,title]);
  return Response.json({ bookmark:{id,scene_id:sceneId,title} }, { status: 201 });
}
export async function DELETE(request: Request) {
  const user = await teacher();if (!user) return Response.json({ error: "Acesso restrito" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");if (!id) return Response.json({ error: "Marcação ausente" }, { status: 400 });
  await query("DELETE FROM teacher_bookmarks WHERE id=$1 AND user_id=$2", [id,user.userId]);return Response.json({ ok:true });
}
