import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://zorivor.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/topup",
          "/transactions",
          "/images/",
          "/fonts/",
          "/og-image.png",
          "/favicon.ico",
          "/favicon-16.png",
          "/favicon-32.png",
          "/apple-touch-icon.png",
          "/_next/static/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/login",
          "/_next/data/",
          "/_next/server/",
          "*.json$",
          "*.map$",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/topup", "/transactions"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/topup", "/transactions"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
