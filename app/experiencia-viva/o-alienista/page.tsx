import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "O Alienista — Experiência audiovisual | Coonto",
  description: "Explore os capítulos de O Alienista em uma experiência audiovisual interativa do Coonto.",
};

const chapterUrl = "https://coonto-alienista-vivo.tguarizo302808.chatgpt.site";

export default function ExperienciaAudiovisualAlienista() {
  return (
    <main style={{ position: "fixed", inset: 0, background: "#071018", color: "#f5f0e6", zIndex: 50 }}>
      <div style={{ minHeight: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 16px", background: "#071018", borderBottom: "1px solid #25313a" }}>
        <a href="/obra/o-alienista" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← Voltar a O Alienista</a>
        <nav aria-label="Capítulos" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/experiencia-viva/o-alienista" aria-current="page" style={{ color: "inherit", fontSize: 14, fontWeight: 700 }}>Capítulo I</a>
          <a href="/experiencia-viva/o-alienista/capitulo-ii" style={{ color: "inherit", fontSize: 14 }}>Capítulo II</a>
        </nav>
        <a href={chapterUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", fontSize: 14 }}>Abrir em nova aba ↗</a>
      </div>
      <iframe
        title="Experiência audiovisual de O Alienista — Capítulo I"
        src={chapterUrl}
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{ display: "block", width: "100%", height: "calc(100svh - 48px)", border: 0 }}
      />
    </main>
  );
}
