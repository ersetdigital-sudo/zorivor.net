export type Game = {
  id: string;
  slug: string;
  name: string;
  publisher: string | null;
  category: string;
  cover_public_id: string | null;
  cover_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  slug: string;
  game_id: string | null;
  game: string;
  category: string;
  denomination: string;
  price_idr: number;
  base_price_idr: number | null;
  cashback_pct: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
  icon_public_id: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "success"
  | "failed"
  | "refunded";

export type Order = {
  id: string;
  invoice: string;
  product_id: string | null;
  game: string;
  denomination: string;
  game_user_id: string;
  game_server_id: string | null;
  whatsapp: string | null;
  payment_method: string | null;
  amount_idr: number;
  cashback_idr: number;
  status: OrderStatus;
  paid_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = {
  id: string;
  code: string;
  label: string;
  group_label: string;
  fee_idr: number;
  sub_label: string | null;
  is_enabled: boolean;
  sort_order: number;
  icon_color: string;
  image_public_id: string | null;
  image_url: string | null;
};

export type SiteSetting = {
  key: string;
  value: unknown;
  updated_at: string;
};

// Image size specs (displayed in admin uploaders)
export const IMAGE_SIZES = {
  gameCover: {
    label: "Game Cover",
    width: 512,
    height: 512,
    aspect: "1:1 (square)",
    maxBytes: 2 * 1024 * 1024,
    formats: ["PNG", "JPG", "WebP"],
  },
  productIcon: {
    label: "Product Icon",
    width: 256,
    height: 256,
    aspect: "1:1 (square, transparent bg ideal)",
    maxBytes: 500 * 1024,
    formats: ["PNG"],
  },
  qris: {
    label: "QRIS Image",
    width: 800,
    height: 960,
    aspect: "5:6",
    maxBytes: 1 * 1024 * 1024,
    formats: ["PNG", "JPG"],
  },
} as const;