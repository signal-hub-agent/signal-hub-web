// src/types/dashboard.ts

export type ItemType = 'token' | 'address' | 'zero-day' | 'subscription';

export interface BaseListItem {
  id: string;
  name: string;
  tags: string[];
  timestamp?: string;
  isSubscribed: boolean;
  metricsSummary: string;
}