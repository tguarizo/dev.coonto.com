import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureAlienistaEntitlement, getMember } from "@/lib/member";
import { getAccessProfile } from "@/lib/access-control";
import { query } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const member = await getMember();
  if (!member) return new Response("Entre na sua conta Coonto.", { status: 401 });
  const teacherMode = new URL(request.url).searchParams.get("mode") === "teacher";
  if(teacherMode){const access=await getAccessProfile(member);if(!access.globalOperation&&!access.personas.includes("educator"))return new Response("Entre pelo espaço do professor.",{status:403});}
  else if (!await ensureAlienistaEntitlement(member.userId,"used")) return new Response("Acesso indisponível.", { status: 403 });
  let html = await readFile(path.join(process.cwd(), "content", "Coonto_O_Alienista.html"), "utf8");
  html = html.replace("const KEY='coonto-alienista-v1-state';", `const KEY=${JSON.stringify(`coonto-alienista-${member.userId}`)};`);
  const init = "window.addEventListener('beforeunload',save);load();render();maybePlaySplash();";
  if (teacherMode) {
    html = html.replace("function save(){localStorage.setItem(KEY,JSON.stringify(state))}", "function save(){}")
      .replace(init, `window.addEventListener('message',event=>{
        if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='coonto:teacher-jump')return;
        const index=SCREENS.findIndex(s=>s.id===event.data.sceneId);if(index<0)return;
        stopAudio();state.idx=index;render();
      });document.getElementById('resetBtn').style.display='none';render();`)
      .replaceAll("localStorage.removeItem(KEY);state=", "state=");
  } else {
    const saved = await query<{ state_json: Record<string, unknown>; updated_at: string }>("SELECT state_json,updated_at FROM learning_progress WHERE user_id=$1 AND work_slug='o-alienista' LIMIT 1", [member.userId]);
    const row = saved.rows[0];
    const seed = row ? { ...row.state_json, updatedAt: Number(row.state_json.updatedAt) || new Date(row.updated_at).getTime() } : null;
    const encoded = JSON.stringify(seed).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
    html = html.replace("function save(){localStorage.setItem(KEY,JSON.stringify(state))}", `function save(){
      try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}
      try{parent.postMessage({type:'coonto:progress',work:'o-alienista',state,percent:pct()},location.origin);}catch(e){}
    }`).replace(init, `window.addEventListener('beforeunload',save);load();const serverState=${encoded};
      if(serverState&&Number.isInteger(serverState.idx)&&serverState.idx>=0&&serverState.idx<SCREENS.length&&Number(serverState.updatedAt)>Number(state.updatedAt||0)){
        state={...state,...serverState,answers:serverState.answers||{},notes:serverState.notes||{},visits:serverState.visits||{}};
        if(state.idx>0&&!state.completed)showResume();else document.getElementById('resume').classList.remove('show');
      }render();maybePlaySplash();`);
  }
  return new Response(html, { headers: {"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Content-Security-Policy":"default-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; frame-ancestors 'self'","X-Content-Type-Options":"nosniff"} });
}
