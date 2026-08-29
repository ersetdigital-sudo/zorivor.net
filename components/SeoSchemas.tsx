"use client";

// Organization + WebSite schema JSON-LD — injected once via RootLayout
export function SeoSchemas() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zorivor",
    url: "https://zorivor.net",
    logo: "https://zorivor.net/og-image.png",
    description:
      "Top up game instan dengan harga final termurah. Proses otomatis 24/7 tanpa biaya admin.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian"],
    },
    sameAs: [],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zorivor",
    url: "https://zorivor.net",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://zorivor.net/topup?game={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

// ItemList schema for homepage game listing
export function GameListSchema({ games }: { games: { name: string; cover?: string | null; id: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Game Populer Zorivor",
    description: "Daftar game top up populer di Zorivor",
    numberOfItems: games.length,
    itemListElement: games.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `Top Up ${g.name}`,
        url: `https://zorivor.net/topup?game=${g.id}`,
        ...(g.cover ? { image: g.cover } : {}),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product schema for per-game top-up pages
export function ProductSchema({
  name,
  publisher,
  cover,
  lowestPrice,
  highestPrice,
  slug,
}: {
  name: string;
  publisher: string | null;
  cover: string | null;
  lowestPrice: number;
  highestPrice: number;
  slug: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Top Up ${name} Murah & Cepat`,
    description: `Top up ${name} dengan harga final termurah, proses otomatis instan. Tersedia berbagai nominal dengan pembayaran QRIS, e-wallet, VA, dan gerai retail.`,
    brand: {
      "@type": "Brand",
      name: publisher ?? name,
    },
    ...(cover
      ? { image: cover.startsWith("/") ? `https://zorivor.net${cover}` : cover }
      : {}),
    url: `https://zorivor.net/topup?game=${slug}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      availability: "https://schema.org/InStock",
      url: `https://zorivor.net/topup?game=${slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      bestRating: "5",
      ratingCount: "500",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQPage schema
export function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
