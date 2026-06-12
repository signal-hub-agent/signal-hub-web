// src/types/alerts.ts

export interface AlertConfig {
  whale_movement: { enabled: boolean; threshold_usd: number };
  smart_swap: { enabled: boolean };
  zero_day: { enabled: boolean; max_contract_age_hours: number };
  liquidity: { enabled: boolean };
  bridge: { enabled: boolean; threshold_usd: number };
}

export interface SubscriptionItem {
  target_id: string;
  target_type: 'TOKEN' | 'ADDRESS' | 'SYSTEM';
  name: string;
  config: AlertConfig;
  created_at: string;
}

export interface AlertMessage {
  alert_id: string;
  target_id: string;
  target_type: 'TOKEN' | 'ADDRESS' | 'SYSTEM';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  is_read: boolean;
  timestamp: string;
}