import { ExperienceFrame } from "@/components/experience-frame";
import { SiteHeader } from "@/components/site-header";
import { ensureAlienistaEntitlement } from "@/lib/member";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeituraAlienista() {
  const user = await requireUser("/leitura/o-alienista");
  const access = await ensureAlienistaEntitlement(user.userId);
  if (!access) redirect("/checkout/o-alienista");
  return <main className="reader-page"><SiteHeader/><ExperienceFrame userId={user.userId}/></main>;
}
