"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopTokens, formatCurrency } from "@/lib/dashboard-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Coins } from "lucide-react";

export function TokenRadar() {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ["dashboard-tokens"],
    queryFn: fetchTopTokens,
    refetchInterval: 300000, // 5分钟刷新
  });

  return (
    <Card className="h-full shadow-none border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-slate-700" />
          <CardTitle className="text-base font-semibold text-slate-800">AI Token Radar</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-lg" />)}
          </div>
        ) : (
          tokens?.map((token) => (
            <div key={token.symbol} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900">{token.symbol}</span>
                <span className="text-sm text-slate-500">Vol: {formatCurrency(token.volume_1h_usd)}</span>
              </div>
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>MEV Toxicity</span>
                  <span>{token.mev_toxicity_pct.toFixed(1)}%</span>
                </div>
                <Progress value={token.mev_toxicity_pct} className="h-1.5" />
              </div>
              {/* AI Insight 核心展示框 */}
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-purple-900/80">{token.ai_insight}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}