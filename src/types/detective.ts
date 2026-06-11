// src/types/detective.ts

export interface TokenBalance {
  symbol: string;
  amount: number;
  usd_value: number;
  percentage: number;
}

export interface FinancialMetrics {
  win_rate: number;
  profit_loss_ratio: number;
  sharpe_ratio: number;
  max_drawdown: number;
  account_growth_30d: number;
  total_trades_30d: number;
  total_volume_usd: number;
  active_days_30d: number;
}

export interface RiskAssessment {
  risk_level: "GREEN" | "YELLOW" | "RED";
  risk_score: number;
  flags: string[];
}

export interface RecentTrade {
  time: string;
  token: string;
  direction: "buy" | "sell";
  amount_usd: number;
  tx_hash: string;
  token_signal?: {
    sfs_score: number | null;
    trend_type: string;
    macd_pos: string;
    rsi_zone: string;
  };
}

export interface TradeQualityStats {
  avg_entry_sfs: number | null;
  high_sfs_ratio: number | null;
  total_evaluated: number;
  explanation: string;
}

export interface LlmAnalysis {
  profile_report?: string;
  pre_rating?: string;
  style_label?: string;
  copy_suggestion?: string;
  key_metrics_summary?: string;
  llm_input_data?: {
    recent_buy_trades_with_signal?: unknown[];
    trade_quality_stats?: TradeQualityStats;
  };
  recent_trades?: RecentTrade[];
}

export interface AddressDetailResponse {
  address: string;
  tags: string[];
  composite_score: number;
  is_dex_trader: boolean;
  metrics: FinancialMetrics | null;
  portfolio: TokenBalance[];
  risk: RiskAssessment;
  last_active: string;
  llm_analysis: LlmAnalysis | null;
  data_source: string;
}

export interface Top100ListItem {
  address: string;
  composite_score: number;
  tags: string[];
  win_rate: number;
  total_volume_30d: number;
}

export interface Top100Response {
  updated_at: string;
  traders: Top100ListItem[];
}