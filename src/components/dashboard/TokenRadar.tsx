"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopTokens, formatCurrency } from "@/lib/dashboard-api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sparkles, Bot, ChevronDown, ChevronUp } from "lucide-react";

export function TokenRadar() {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ["dashboard-tokens"],
    queryFn: fetchTopTokens,
    refetchInterval: 300000, // 5分钟刷新
  });

  return (
    // 统一设定 750px 高度，内部开启 overflow-y-auto 实现滚动
    <Card className="h-[750px] flex flex-col shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
      {/* 统一规范的标题栏 */}
      <CardHeader className="pb-4 pt-5 px-5 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Token Radar</h2>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
        <div className="p-5 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-xl" />)}
            </div>
          ) : (
            tokens?.map((token, index) => (
              <div key={token.symbol} className="group relative border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                {/* 第一行：排名、Logo、名称、AI 分数 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-lg font-black shrink-0 shadow-inner">
                      {token.symbol.charAt(0)}
                    </div>
                    
                    <div>
                      <div className="font-bold text-slate-900 text-lg leading-none">${token.symbol}</div>
                      <div className="text-sm text-slate-400 mt-1">{token.name || `${token.symbol} Token`}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Score</div>
                    <div className="text-2xl font-black text-indigo-600 leading-none mt-1">
                      {token.ai_score?.toFixed(1) || "90.0"}
                    </div>
                  </div>
                </div>

                {/* 第二行：量价数据与 MEV 污染度 */}
                <div className="grid grid-cols-2 gap-4 mb-3 px-1">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Volume (1H)</div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-base font-bold text-slate-900">{formatCurrency(token.volume_1h_usd)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">MEV Toxicity</div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-base font-bold text-slate-900">{token.mev_toxicity_pct.toFixed(1)}%</span>
                      <span className={`flex items-center text-xs font-bold ${token.mev_toxicity_pct <= 5.0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {token.mev_toxicity_pct <= 5.0 ? 'Low' : 'High'}
                        {token.mev_toxicity_pct <= 5.0 ? <ChevronDown className="w-3 h-3 ml-0.5" /> : <ChevronUp className="w-3 h-3 ml-0.5" />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 第三行：AI Insight 卡片 */}
                <div className="p-3 bg-[#F8F7FF] rounded-xl border border-indigo-100/50 flex items-start space-x-2 mt-2">
                  <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed text-indigo-950/80">
                    <span className="font-bold text-indigo-600 mr-1.5 tracking-wide">[AI Insight]</span>
                    {token.ai_insight}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}