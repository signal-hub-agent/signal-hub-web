import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface KpiData {
  volume_24h_usd: number;
  active_smart_money_count: number;
  alerts_today: number;
}

export interface TokenRadarItem {
  symbol: string;
  volume_1h_usd: number;
  mev_toxicity_pct: number;
  ai_insight: string;
}

export interface SmartMoneyItem {
  address: string;
  win_rate: number;
  pnl_ratio: number;
  tags: string[];
  ai_profiling: string;
}

export interface AlertMessage {
  event_id: string;
  target_address: string;
  event_type: "WHALE_MOVEMENT" | "SMART_SWAP" | "ZERO_DAY" | "LIQUIDITY" | "BRIDGE";
  chain_name: string;
  tx_hash: string;
  timestamp: number;
  data: Record<string, string | number | boolean | null>;
}

export const fetchKpis = async (): Promise<KpiData> => {
  const { data } = await axios.get(`${API_BASE}/dashboard/kpis`);
  return data;
};

export const fetchTopTokens = async (): Promise<TokenRadarItem[]> => {
  const { data } = await axios.get(`${API_BASE}/dashboard/tokens/top`);
  return data;
};

export const fetchTopSmartMoney = async (): Promise<SmartMoneyItem[]> => {
  const { data } = await axios.get(`${API_BASE}/dashboard/smart-money/top`);
  return data;
};

// 工具函数：格式化美元
export const formatCurrency = (value: number) => {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

// 工具函数：截断地址
export const truncateAddress = (addr: string) => {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};