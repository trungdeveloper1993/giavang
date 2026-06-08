export interface GoldItem {
  id: string;
  name: string;
  type: string; // 'sjc' | 'nhan_pure' | 'vang_18k' | 'vang_14k' | 'vang_10k' | string
  buyPrice: number; // in VND per chỉ or lượng (e.g. 7.55 for 7.550.000 VND / chỉ)
  sellPrice: number; // in VND
  buyChange: number; // buy price change compared to previous session
  sellChange: number; // sell price change
  unit: 'chỉ' | 'lượng' | '2 chỉ' | string;
  purity: string; // e.g., "99.99%", "75%", "58.3%"
  description?: string;
  updateTime: string;
}

export interface ChartDataPoint {
  time: string; // e.g. "09:00", "05/06"
  dateLabel: string; // Full date format "05/06/2026"
  buyPrice: number;
  sellPrice: number;
}

export interface GoldShopConfig {
  id: string;
  name: string;
  alias: string; // e.g. "kim-mon"
  address: string;
  phone: string;
  website: string;
  logoUrl?: string;
  facebookUrl?: string; // Optional socials
  zaloUrl?: string;
  notes?: string[];
  // Formulas/multipliers relative to benchmark SJC or basic pricing model
  // This allows easy multi-configuration!
  goldTypes: {
    id: string;
    name: string;
    type: string;
    purity: string;
    unit: 'chỉ' | 'lượng' | '2 chỉ' | string;
    baseBuyMultiplier: number; // percentage or premium added to gold base price
    baseSellMultiplier: number;
    spreadVND: number; // spread between buy and sell in VND per unit
    description: string;
  }[];
}

export interface AppConfig {
  currentShopId: string;
  shops: GoldShopConfig[];
  refreshIntervalMs: number;
}
