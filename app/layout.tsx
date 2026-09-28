import type { Metadata } from "next";
import "./globals.css";
import { WebMcpTools } from "@/components/webmcp-tools";
import { PwaRegistrar } from "@/components/pwa-registrar";

export const metadata: Metadata = {
  title: "Coonto — Entre na obra. Saia compreendendo.",
  description: "Perdeu o fio de um livro? Entre na história, faça escolhas, descubra pistas e volte ao texto para conferir suas ideias.",
  icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><WebMcpTools /><PwaRegistrar />{children}</body></html>;
}
