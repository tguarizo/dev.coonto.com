import { COONTO_VERSION } from "@/lib/version";
import { databaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const database = await databaseHealth();
    return Response.json({ ok: database, service: "coonto", version: COONTO_VERSION, database: database ? "ready" : "unavailable" }, { status: database ? 200 : 503 });
  } catch (error) {
    console.error("health_check_failed", error);
    return Response.json({ ok: false, service: "coonto", version: COONTO_VERSION, database: "unavailable" }, { status: 503 });
  }
}
