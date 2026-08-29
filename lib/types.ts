export type Product = {
  id: string;
  slug: string;
  game: string;
  category: string;
  denomination: string;
  price_idr: number;
  base_price_idr: number | null;
  cashback_pct: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
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

export type SiteSetting = {
  key: string;
  value: unknown;
  updated_at: string;
};