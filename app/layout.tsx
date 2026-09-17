import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const SITE_URL = "https://noot-lp.vercel.app";
const DESCRIPTION = "Toda a execução em um time só. Você traz a demanda e recebe o projeto pronto.";

export const metadata: Metadata = {
  // Resolves the generated opengraph-image to an absolute URL, which is the
  // only form crawlers accept.
  metadataBase: new URL(SITE_URL),
  title: "Noot — Construímos o que o seu time precisa",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Noot",
    title: "Noot — Construímos o que o seu time precisa",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Noot — Construímos o que o seu time precisa",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
