"use client";

import { useEffect, useRef, useState } from "react";

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
  const [activeRoman, setActiveRoman] = useState(chapter.roman);
  const [progress, setProgress] = useState<{ scene: number; total: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const experienceUrl = new URL(chapter.page, base).toString();
  const chapterLabel = (value: string) => value === "0" ? "Zero" : value;

  useEffect(() => {
    setActiveRoman(chapter.roman);
    setProgress(null);
  }, [chapter.roman]);

  useEffect(() => {
    const expectedOrigin = new URL(base).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin || event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.type !== "coonto:alienista-progress") return;
      if (!alienistaChapters.some((item) => item.roman === data.roman)) return;
      setActiveRoman(data.roman);
      if (Number.isFinite(data.scene) && Number.isFinite(data.total)) {
        setProgress({ scene: data.scene, total: data.total });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [chapter.roman]);

  return (
    <main style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#071018", color: "#f5f0e6", zIndex: 50 }}>
      <header style={{ minHeight: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 16px", background: "#071018", borderBottom: "1px solid #25313a" }}>
        <a href="/obra/o-alienista" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← O Alienista</a>
        <p aria-live="polite" style={{ margin: 0, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#f5f0e6" }}>
          Capítulo {chapterLabel(activeRoman)}{progress ? ` · Cena ${progress.scene} / ${progress.total}` : ""}
        </p>
      </header>
      <iframe
        ref={iframeRef}
        title={`Experiência audiovisual de O Alienista — Capítulo ${chapterLabel(chapter.roman)}`}
        src={experienceUrl}
        allow="autoplay; fullscreen"
        allowFullScreen
        referrerPolicy="origin"
        style={{ display: "block", flex: 1, width: "100%", minHeight: 0, border: 0 }}
      />
    </main>
  );
}
