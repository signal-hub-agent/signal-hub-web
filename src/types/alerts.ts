// src/types/alerts.ts
export interface AlertMessage {
  alert_id: string;
  target_id: string;
  target_type: 'TOKEN' | 'ADDRESS' | 'SYSTEM';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  is_read: boolean;
  timestamp: string;
}