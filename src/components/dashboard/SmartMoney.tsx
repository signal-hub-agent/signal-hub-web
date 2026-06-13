"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopSmartMoney, truncateAddress } from "@/lib/dashboard-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Bot } from "lucide-react";

export function SmartMoney() {
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["dashboard-smart-money"],
    queryFn: fetchTopSmartMoney,
    refetchInterval: 300000, 
  });

  return (
    <Card className="h-full shadow-none border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
          <CardTitle className="text-base font-semibold text-slate-800">Smart Money Detective</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-lg" />)}
          </div>
        ) : (
          addresses?.map((item) => (
            <div key={item.address} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-mono text-sm font-medium text-slate-800">{truncateAddress(item.address)}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 hover:bg-slate-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-600">胜率 {item.win_rate.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400 mt-0.5">PnL: {item.pnl_ratio.toFixed(2)}x</div>
                </div>
              </div>
              {/* AI Profiling 展示框 */}
              <div className="mt-3 p-2.5 bg-blue-50/50 rounded-md flex items-start space-x-2">
                <Bot className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-blue-800/80">{item.ai_profiling}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}