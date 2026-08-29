import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zorivor — Top Up Game Termurah, Tanpa Biaya Admin",
  description:
    "Top up ML, FF, PUBG, Genshin dan ratusan game lain dengan harga final termurah. Proses instan 24/7, tanpa biaya admin.",
  metadataBase: new URL("https://zorivor.net"),
  applicationName: "Zorivor",
  keywords: [
    "top up game",
    "top up mobile legends",
    "top up diamond",
    "diamond ML",
    "free fire",
    "PUBG Mobile",
    "Genshin Impact",
    "valorant",
    "cashback",
    "pulsa",
    "e-wallet",
  ],
  authors: [{ name: "Zorivor" }],
  creator: "Zorivor",
  publisher: "Zorivor",
  formatDetection: { email: false, address: false, telephone: false },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://zorivor.net",
    siteName: "Zorivor",
    title: "Zorivor — Top Up Game Termurah, Tanpa Biaya Admin",
    description:
      "Top up ML, FF, PUBG, Genshin dan ratusan game lain dengan harga final termurah. Proses instan 24/7.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zorivor — Top up game instan, harga final termurah.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Zorivor — Top Up Game Termurah, Tanpa Biaya Admin",
    description:
      "Top up ML, FF, PUBG, Genshin dan ratusan game lain. Proses instan 24/7.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
