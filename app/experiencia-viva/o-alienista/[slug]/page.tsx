import { notFound } from "next/navigation";
import { ChapterFrame } from "../ChapterFrame";

const chapters = [
  { slug: "capitulo-i", roman: "I" },
  { slug: "capitulo-iii", roman: "III" },
  { slug: "capitulo-iv", roman: "IV" },
  { slug: "capitulo-v", roman: "V" },
  { slug: "capitulo-vi", roman: "VI" },
  { slug: "capitulo-vii", roman: "VII" },
  // Old chapter URLs remain valid and resolve to their new combined part.
  { slug: "capitulo-viii", roman: "V" },
  { slug: "capitulo-ix", roman: "VI" },
  { slug: "capitulo-x", roman: "VI" },
  { slug: "capitulo-xi", roman: "VII" },
  { slug: "capitulo-xii", roman: "VII" },
  { slug: "capitulo-xiii", roman: "VII" },
];

export function generateStaticParams() {
  return chapters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);
  return { title: chapter ? `O Alienista — Capítulo ${chapter.roman} | Coonto` : "Capítulo não encontrado | Coonto" };
}

export default async function AlienistaChapterRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);
  if (!chapter) notFound();
  return <ChapterFrame roman={chapter.roman} />;
}
