// src/types/dashboard.ts

export type SignalColor = "green" | "yellow" | "red";
export type Bias = "BULLISH" | "BEARISH" | "NEUTRAL";

// 解析 LLM 返回的 JSON 字符串对应的结构
export interface ParsedLlmReport {
  bias: Bias;
  summary: string;
  bullish_factors: string[];
  bearish_factors: string[];
  support_levels: number[];
  resistance_levels: number[];
}

export interface MetricDetailBase {
  label: string;
  score: number;
  max_score: number;
  is_real_data: boolean;
  status?: string | null;
}

export interface VolumeTrendDetail extends MetricDetailBase {
  details: {
    volume_24h_usd?: number;
    volume_7d_avg_usd?: number;
    ratio?: number;
    tx_count_24h?: number;
    trend_label?: string;
    [key: string]: unknown;
  };
}

export interface MevToxicityDetail extends MetricDetailBase {
  details: {
    toxicity_pct?: number;
    mev_suspicious_txs?: number;
    mev_total_txs?: number;
    toxicity_label?: string;
    [key: string]: unknown;
  };
}

export interface ContractSafetyDetail extends MetricDetailBase {
  details: { risk_items?: string[]; [key: string]: unknown };
}

export interface TechnicalBiasDetail extends MetricDetailBase {
  details: {
    ma_trend?: string;
    ma_alignment?: string;
    rsi_zone?: string;
    rsi_value?: number;
    macd_position?: string;
    macd_histogram_trend?: string;
    macd_divergence?: string;
    bollinger_pattern?: string;
    bollinger_support?: number;
    bollinger_resistance?: number;
    [key: string]: unknown;
  };
}

export interface ComponentScores {
  volume_trend: VolumeTrendDetail;
  mev_toxicity: MevToxicityDetail;
  contract_safety: ContractSafetyDetail;
  technical_bias: TechnicalBiasDetail;
}

export interface TokenSignalResponse {
  token_symbol: string;
  token_address?: string | null;
  current_price: number;
  total_score: number;
  signal_color: SignalColor;
  llm_report?: string | null; // 这是个 JSON 字符串
  components: ComponentScores;
  generated_at: string;
  data_source: string;
}