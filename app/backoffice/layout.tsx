import "./crm/styles.css";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { isCrmHost } from "@/lib/admin-host";
import { CrmSidebar } from "@/components/crm-sidebar";

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const crm = await isCrmHost();
  const user = crm ? await getCurrentUser() : null;
  if (!crm || user?.role !== "admin") return children;
  return <div className="crm-workspace"><Suspense fallback={<aside className="crm-sidebar" aria-label="Carregando menu"/>}><CrmSidebar/></Suspense><div className="crm-workspace-main">{children}</div></div>;
}
