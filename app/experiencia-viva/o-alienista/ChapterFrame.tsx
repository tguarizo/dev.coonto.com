"use client";

const base = "https://coonto-alienista-vivo.tguarizo302808.chatgpt.site";

export const alienistaChapters = [
  { roman: "0", title: "Itaguaí antes da Casa Verde", page: "/", route: "/experiencia-viva/o-alienista" },
  { roman: "I", title: "A casa que ninguém entendia", page: "/capitulo-i.html", route: "/experiencia-viva/o-alienista/capitulo-i" },
  { roman: "II", title: "Torrentes de loucos", page: "/capitulo-ii.html", route: "/experiencia-viva/o-alienista/capitulo-ii" },
  { roman: "III", title: "O olhar se amplia", page: "/capitulo-iii.html", route: "/experiencia-viva/o-alienista/capitulo-iii" },
  { roman: "IV", title: "A classificação alcança Itaguaí", page: "/capitulo-iv.html", route: "/experiencia-viva/o-alienista/capitulo-iv" },
  { roman: "V", title: "A revolta e a Casa Verde", page: "/capitulo-v.html", route: "/experiencia-viva/o-alienista/capitulo-v" },
  { roman: "VI", title: "O poder muda; o método permanece", page: "/capitulo-vi.html", route: "/experiencia-viva/o-alienista/capitulo-vi" },
  { roman: "VII", title: "A teoria e o julgador", page: "/capitulo-vii.html", route: "/experiencia-viva/o-alienista/capitulo-vii" },
];

export function ChapterFrame({ roman }: { roman: string }) {
  const chapter = alienistaChapters.find((item) => item.roman === roman) ?? alienistaChapters[0];
  const chapterLabel = chapter.roman === "0" ? "Zero" : chapter.roman;
  const chapterUrl = new URL(chapter.page, base);
  if (["I", "II", "III", "IV", "V", "VI", "VII"].includes(chapter.roman)) chapterUrl.searchParams.set("build", "0.99.103");

  return (
    <main style={{ position: "fixed", inset: 0, background: "#071018", zIndex: 50 }}>
      <iframe
        title={`Experiência audiovisual de O Alienista — Capítulo ${chapterLabel}`}
        src={chapterUrl.toString()}
        allow="autoplay; fullscreen"
        allowFullScreen
        referrerPolicy="origin"
        style={{ display: "block", width: "100%", height: "100%", border: 0 }}
      />
    </main>
  );
}
