import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const base = "https://coonto-alienista-vivo.tguarizo302808.chatgpt.site";

export const alienistaChapters = [
  { roman: "I", title: "A casa que ninguém entendia", page: "/", route: "/experiencia-viva/o-alienista" },
  { roman: "II", title: "Torrentes de loucos", page: "/capitulo-ii.html", route: "/experiencia-viva/o-alienista/capitulo-ii" },
  { roman: "III", title: "O olhar se amplia", page: "/capitulo-iii.html", route: "/experiencia-viva/o-alienista/capitulo-iii" },
  { roman: "IV", title: "A classificação alcança Itaguaí", page: "/capitulo-iv.html", route: "/experiencia-viva/o-alienista/capitulo-iv" },
  { roman: "V", title: "A revolta e a Casa Verde", page: "/capitulo-v.html", route: "/experiencia-viva/o-alienista/capitulo-v" },
  { roman: "VI", title: "O poder muda; o método permanece", page: "/capitulo-vi.html", route: "/experiencia-viva/o-alienista/capitulo-vi" },
  { roman: "VII", title: "A teoria e o julgador", page: "/capitulo-vii.html", route: "/experiencia-viva/o-alienista/capitulo-vii" },
];

export function ChapterFrame({ roman }: { roman: string }) {
  const initialIndex = Math.max(0, alienistaChapters.findIndex((item) => item.roman === roman));
  const [activeRoman, setActiveRoman] = useState(roman);
  const [progress, setProgress] = useState<{ scene: number; total: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const current = alienistaChapters.findIndex((item) => item.roman === activeRoman);
  const chapter = alienistaChapters[current] ?? alienistaChapters[initialIndex];
  const experienceUrl = new URL(chapter.page, base).toString();
  const previous = alienistaChapters[current - 1];
  const next = alienistaChapters[current + 1];

  useEffect(() => {
    setActiveRoman(roman);
    setProgress(null);
  }, [roman]);

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
  }, []);

  return (
    <main style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#071018", color: "#f5f0e6", zIndex: 50 }}>
      <header style={{ minHeight: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 16px", background: "#071018", borderBottom: "1px solid #25313a" }}>
        <a href="/obra/o-alienista" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← O Alienista</a>
        <nav aria-label="Navegação entre capítulos" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {previous ? <Link prefetch href={previous.route} style={{ color: "inherit", fontSize: 14 }}>← Capítulo {previous.roman}</Link> : <span aria-hidden="true" />}
          <details style={{ position: "relative", fontSize: 14 }}>
            <summary style={{ cursor: "pointer", listStyle: "none", fontWeight: 700, padding: "6px 10px", border: "1px solid #51606b", borderRadius: 8 }}>
              Capítulo {activeRoman}{progress ? ` · Cena ${progress.scene}/${progress.total}` : ""} ▾
            </summary>
            <div style={{ position: "absolute", zIndex: 60, top: 38, left: "50%", transform: "translateX(-50%)", display: "grid", gridTemplateColumns: "repeat(3, minmax(72px, 1fr))", gap: 4, width: 260, padding: 8, border: "1px solid #51606b", borderRadius: 10, background: "#101a20", boxShadow: "0 12px 32px #0009" }}>
              {alienistaChapters.map((item) => <Link prefetch key={item.roman} href={item.route} title={item.title} aria-current={item.roman === activeRoman ? "page" : undefined} style={{ color: "inherit", padding: "8px 6px", borderRadius: 6, textAlign: "center", textDecoration: "none", background: item.roman === activeRoman ? "#293944" : "transparent" }}>Cap. {item.roman}</Link>)}
            </div>
          </details>
          {next ? <Link prefetch href={next.route} style={{ color: "inherit", fontSize: 14 }}>Capítulo {next.roman} →</Link> : <span aria-hidden="true" />}
        </nav>
      </header>
      <iframe
        ref={iframeRef}
        title={`Experiência audiovisual de O Alienista — Capítulo ${activeRoman}`}
        src={experienceUrl}
        allow="autoplay; fullscreen"
        allowFullScreen
        referrerPolicy="origin"
        style={{ display: "block", flex: 1, width: "100%", minHeight: 0, border: 0 }}
      />
    </main>
  );
}
