"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTopSmartMoney, truncateAddress } from "@/lib/dashboard-api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles } from "lucide-react";

export function SmartMoney() {
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["dashboard-smart-money"],
    queryFn: fetchTopSmartMoney,
    refetchInterval: 300000, 
  });

  return (
    <Card className="h-[750px] flex flex-col shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
      {/* 统一规范的标题栏 */}
      <CardHeader className="pb-4 pt-5 px-5 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Detective</h2>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
        <div className="p-5 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-xl" />)}
            </div>
          ) : (
            addresses?.map((item, index) => (
              <div key={item.address} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                
                {/* 排名、头像与核心数据 */}
                <div className="flex items-start space-x-3 mb-4">
                  {/* 排名序号 */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold shrink-0 mt-1">
                    {index + 1}
                  </div>
                  
                  {/* 自动生成的地址渐变头像 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 shrink-0 shadow-inner flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    {item.address.slice(2, 4).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    {/* 地址与 Score */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-slate-900 text-base">{truncateAddress(item.address)}</div>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none font-semibold px-2.5">
                        Score {item.score || 0}
                      </Badge>
                    </div>
                    
                    {/* 胜率与 PnL */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Win Rate</div>
                        <div className="font-bold text-slate-900">{item.win_rate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">PnL (30D)</div>
                        <div className={`font-bold ${item.pnl_ratio >= 1 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item.pnl_ratio >= 1 ? '+' : ''}{item.pnl_ratio.toFixed(2)}x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Profiling 展示框 */}
                <div className="p-3 bg-[#F8F7FF] rounded-xl border border-indigo-100/50 flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed text-indigo-950/80">
                    <span className="font-bold text-indigo-600 mr-1.5 tracking-wide">[AI Profiling]</span>
                    {item.ai_profiling}
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