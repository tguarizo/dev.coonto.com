import { query } from "@/lib/db";
import { findPublishedWork } from "@/lib/catalog-works";

export async function getCommercialSettings() {
  const result = await query<{ single_price_cents: number; club_price_cents: number; free_work_slug: string }>("SELECT single_price_cents,club_price_cents,free_work_slug FROM commercial_settings WHERE id=1");
  const settings = result.rows[0] ?? { single_price_cents: 990, club_price_cents: 1990, free_work_slug: "o-alienista" };
  return { ...settings, freeWork: findPublishedWork(settings.free_work_slug) ?? findPublishedWork("o-alienista")! };
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
