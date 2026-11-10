import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "O Alienista — Experiência audiovisual | Coonto",
  description: "Explore o Capítulo I de O Alienista em uma experiência audiovisual interativa do Coonto.",
};

const chapterUrl = "https://coonto-alienista-vivo.tguarizo302808.chatgpt.site";

export default function ExperienciaAudiovisualAlienista() {
  return (
    <main style={{ position: "fixed", inset: 0, background: "#071018", color: "#f5f0e6", zIndex: 50 }}>
      <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "#071018", borderBottom: "1px solid #25313a" }}>
        <a href="/obra/o-alienista" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>← Voltar a O Alienista</a>
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
