export const publishedWorks = [
  { slug: "o-alienista", title: "O Alienista", author: "Machado de Assis", href: "/obra/o-alienista", checkoutHref: "/checkout/o-alienista" },
] as const;

export type PublishedWorkSlug = (typeof publishedWorks)[number]["slug"];

export function findPublishedWork(slug: string) {
  return publishedWorks.find(work => work.slug === slug);
}
