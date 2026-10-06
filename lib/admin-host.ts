import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const crmDomain = () => process.env.CRM_DOMAIN || "crm.dev.coonto.com";

export async function isCrmHost() {
  const requestHeaders = await headers();
  const hostname = (value: string | null) => {
    const match = value?.trim().toLowerCase().match(/^([a-z0-9.-]+)(?::\d+)?$/);
    return match?.[1];
  };
  const host = hostname(requestHeaders.get("host"));
  const domain = crmDomain().toLowerCase();
  if (host === domain) return true;
  // Next forwards Server Action redirects to its own listening address,
  // keeping the original public host in x-forwarded-host. Only accept that
  // header on these internal addresses; a different public host stays denied.
  if (!host || !["127.0.0.1", "0.0.0.0", "localhost"].includes(host)) return false;
  return hostname(requestHeaders.get("x-forwarded-host")) === domain;
}

export async function requireCrmHost() {
  if (!await isCrmHost()) notFound();
}
