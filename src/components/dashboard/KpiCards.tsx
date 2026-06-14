"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchKpis, formatCurrency } from "@/lib/dashboard-api";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Droplets, Zap, ShieldAlert, ArrowLeftRight } from "lucide-react";

export function KpiCards() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: fetchKpis,
    refetchInterval: 3000, 
  });

  if (isLoading || isError) {
    return <div className="h-28 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />;
  }

  const kpis = [
    {
      title: "Smart Swaps",
      mainValue: formatCurrency(data?.smart_swaps_sum || 0),
      subValue: `${data?.smart_swaps_count || 0} Txns`,
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      color: "text-slate-900",
    },
    {
      title: "Whale Moves",
      mainValue: formatCurrency(data?.whale_moves_sum || 0),
      subValue: `${data?.whale_moves_count || 0} Txns`,
      icon: <Waves className="h-4 w-4 text-blue-500" />,
      color: "text-slate-900",
    },
    {
      title: "Liquidity Flow",
      mainValue: formatCurrency(data?.liquidity_sum || 0),
      subValue: `${data?.liquidity_count || 0} Events`,
      icon: <Droplets className="h-4 w-4 text-cyan-500" />,
      color: "text-slate-900",
    },
    {
      title: "Bridge Transfers",
      mainValue: formatCurrency(data?.bridges_sum || 0),
      subValue: `${data?.bridges_count || 0} Txns`,
      icon: <ArrowLeftRight className="h-4 w-4 text-indigo-500" />,
      color: "text-slate-900",
    },
    {
      title: "Zero-Day Alerts",
      mainValue: data?.zero_day_count || 0,
      subValue: "Unknown Pools",
      icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
      color: "text-slate-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="shadow-sm border-slate-100 bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center space-x-2 text-slate-500 mb-3">
              {kpi.icon}
              <span className="text-xs font-medium">{kpi.title}</span>
            </div>
            <div>
              <div className={`text-2xl font-bold tracking-tight ${kpi.color}`}>
                {kpi.mainValue}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                {kpi.subValue}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}