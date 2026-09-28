import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ALIENISTA_SLUG } from "@/lib/member";
import { recordCrmEvent } from "@/lib/crm-events";
import { getCommercialSettings } from "@/lib/commercial";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para concluir o pedido." }, { status: 401 });
  // Atrás do Caddy, request.url pode conter o endereço interno do contêiner.
  // O navegador envia a origem pública configurada para a aplicação.
  const publicOrigin = process.env.NODE_ENV === "production" && process.env.DOMAIN
    ? `https://${process.env.DOMAIN}` : new URL(request.url).origin;
  if (request.headers.get("origin") && request.headers.get("origin") !== publicOrigin)
    return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const settings = await getCommercialSettings();
    if (settings.freeWork.slug !== ALIENISTA_SLUG)
      return Response.json({ error: "Esta obra não está na oferta gratuita atual. Consulte o catálogo." }, { status: 409 });
    // O pedido e o acesso nascem na mesma instrução: não há cobrança nem provedor de pagamento.
    const result = await query<{ id:string }>(`
      WITH purchased AS (
        INSERT INTO free_orders (id,user_id,work_slug,amount_cents,status)
        VALUES ($1,$2,$3,0,'completed')
        ON CONFLICT (user_id,work_slug) DO UPDATE SET status='completed'
        RETURNING id
      ), granted AS (
        INSERT INTO entitlements (id,user_id,work_slug,source,status)
        SELECT $4,$2,$3,'free-order','active' FROM purchased WHERE true
        ON CONFLICT (user_id,work_slug) DO UPDATE SET status='active'
        RETURNING id
      ) SELECT purchased.id FROM purchased CROSS JOIN granted
    `, [crypto.randomUUID(),user.userId,ALIENISTA_SLUG,crypto.randomUUID()]);
    await recordCrmEvent({ type: "free_order_completed", userId: user.userId, relatedType: "work", relatedId: ALIENISTA_SLUG, channel: "free" });
    return Response.json({ ok:true, orderId:result.rows[0].id, totalCents:0 });
  } catch (error) {
    console.error("free_checkout_failed", error);
    return Response.json({ error:"Não foi possível concluir o pedido gratuito agora." }, { status:503 });
  }
}
