import { notFound } from "next/navigation";
import { ChapterFrame } from "../ChapterFrame";

const chapters = [
  { slug: "capitulo-iii", roman: "III" },
  { slug: "capitulo-iv", roman: "IV" },
  { slug: "capitulo-v", roman: "V" },
  { slug: "capitulo-vi", roman: "VI" },
  { slug: "capitulo-vii", roman: "VII" },
  { slug: "capitulo-viii", roman: "VIII" },
  { slug: "capitulo-ix", roman: "IX" },
  { slug: "capitulo-x", roman: "X" },
  { slug: "capitulo-xi", roman: "XI" },
  { slug: "capitulo-xii", roman: "XII" },
  { slug: "capitulo-xiii", roman: "XIII" },
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
