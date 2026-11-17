const base = "https://coonto-alienista-vivo.tguarizo302808.chatgpt.site";

export const alienistaChapters = [
  { roman: "I", title: "A casa que ninguém entendia", slug: "", route: "/experiencia-viva/o-alienista" },
  { roman: "II", title: "Torrentes de loucos", slug: "capitulo-ii", route: "/experiencia-viva/o-alienista/capitulo-ii" },
  { roman: "III", title: "O olhar se amplia", slug: "capitulo-iii", route: "/experiencia-viva/o-alienista/capitulo-iii" },
  { roman: "IV", title: "A classificação alcança Itaguaí", slug: "capitulo-iv", route: "/experiencia-viva/o-alienista/capitulo-iv" },
  { roman: "V", title: "A revolta e a Casa Verde", slug: "capitulo-v", route: "/experiencia-viva/o-alienista/capitulo-v" },
  { roman: "VI", title: "O poder muda; o método permanece", slug: "capitulo-vi", route: "/experiencia-viva/o-alienista/capitulo-vi" },
  { roman: "VII", title: "A teoria e o julgador", slug: "capitulo-vii", route: "/experiencia-viva/o-alienista/capitulo-vii" },
];

export function ChapterFrame({ roman }: { roman: string }) {
  const current = alienistaChapters.findIndex((chapter) => chapter.roman === roman);
  const chapter = alienistaChapters[current];
  const page = chapter.slug ? `/${chapter.slug}.html` : "/";
  const previous = alienistaChapters[current - 1];
  const next = alienistaChapters[current + 1];

  return (
    <main style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#071018", color: "#f5f0e6", zIndex: 50 }}>
      <header style={{ minHeight: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 16px", background: "#071018", borderBottom: "1px solid #25313a" }}>
        <a href="/obra/o-alienista" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← O Alienista</a>
        <nav aria-label="Navegação entre capítulos" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {previous ? <a href={previous.route} style={{ color: "inherit", fontSize: 14 }}>← Parte {previous.roman}</a> : <span aria-hidden="true" />}
          <details style={{ position: "relative", fontSize: 14 }}>
            <summary style={{ cursor: "pointer", listStyle: "none", fontWeight: 700, padding: "6px 10px", border: "1px solid #51606b", borderRadius: 8 }}>Parte {roman} ▾</summary>
            <div style={{ position: "absolute", zIndex: 60, top: 38, left: "50%", transform: "translateX(-50%)", display: "grid", gridTemplateColumns: "repeat(3, minmax(72px, 1fr))", gap: 4, width: 260, padding: 8, border: "1px solid #51606b", borderRadius: 10, background: "#101a20", boxShadow: "0 12px 32px #0009" }}>
              {alienistaChapters.map((item) => <a key={item.roman} href={item.route} title={item.title} aria-current={item.roman === roman ? "page" : undefined} style={{ color: "inherit", padding: "8px 6px", borderRadius: 6, textAlign: "center", textDecoration: "none", background: item.roman === roman ? "#293944" : "transparent" }}>Parte {item.roman}</a>)}
            </div>
          </details>
          {next ? <a href={next.route} style={{ color: "inherit", fontSize: 14 }}>Parte {next.roman} →</a> : <span aria-hidden="true" />}
        </nav>
        <a href={`${base}${page}`} target="_blank" rel="noreferrer" style={{ color: "inherit", fontSize: 14 }}>Abrir em nova aba ↗</a>
      </header>
      <iframe
        title={`Experiência audiovisual de O Alienista — Parte ${roman}`}
        src={`${base}${page}`}
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{ display: "block", flex: 1, width: "100%", minHeight: 0, border: 0 }}
      />
    </main>
  );
}
