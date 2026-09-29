import { databaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const database = await databaseHealth();
    return Response.json({ ok: database, service: "coonto", version: "1.8.0", database: database ? "ready" : "unavailable" }, { status: database ? 200 : 503 });
  } catch (error) {
    console.error("health_check_failed", error);
    return Response.json({ ok: false, service: "coonto", version: "1.8.0", database: "unavailable" }, { status: 503 });
  }
}
