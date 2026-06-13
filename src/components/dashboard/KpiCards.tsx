"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchKpis, formatCurrency } from "@/lib/dashboard-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BrainCircuit, AlertTriangle } from "lucide-react";

export function KpiCards() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: fetchKpis,
    refetchInterval: 60000, // 每分钟自动刷新
  });

  if (isLoading || isError) {
    return <div className="h-32 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">24H Monitored Volume</CardTitle>
          <Activity className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">
            {formatCurrency(data?.volume_24h_usd || 0)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Active Smart Money</CardTitle>
          <BrainCircuit className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">
            {data?.active_smart_money_count || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Alerts Triggered Today</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight text-red-600">
            {data?.alerts_today || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}