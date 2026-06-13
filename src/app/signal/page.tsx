"use client";

import { useState, useMemo } from "react";
import { useTokenSignals } from "@/hooks/useTokenSignals";
import { ParsedLlmReport } from "@/types/dashboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AlertTriangle, Activity, ShieldCheck, Flame, Search, BellRing } from "lucide-react";

// 辅助颜色函数
const getColorClasses = (color: string) => {
  switch (color) {
    case "green": return "bg-green-500";
    case "yellow": return "bg-yellow-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getTextColor = (color: string) => {
  switch (color) {
    case "green": return "text-green-600";
    case "yellow": return "text-yellow-600";
    case "red": return "text-red-600";
    default: return "text-gray-600";
  }
};

export default function TokenSignalPage() {
  const { data, isLoading, error } = useTokenSignals();
  
  // 状态管理：搜索与分页
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // 每页显示 10 个代币

  // 搜索与过滤逻辑（支持按 Symbol 或 地址 模糊搜索）
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((signal) => {
      const matchSymbol = signal.token_symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAddress = signal.token_address?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSymbol || matchAddress;
    });
  }, [data, searchQuery]);

  // 分页切片计算
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center space-x-2"><Activity className="animate-spin w-5 h-5"/> <span>Synchronizing global token signal pool...</span></div>;
  if (error) return <div className="p-8 text-red-500">Failed to load data: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* 顶部：标题栏与搜索区 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2">
          <Flame className="text-orange-500 w-6 h-6 fill-orange-100" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Top 50 Trending Signals</h1>
        </div>
        
        <div className="relative w-full md:w-96 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by token symbol or address..."
            className="pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // 输入搜索时自动重置回第一页
            }}
          />
        </div>
      </div>

      {/* 核心区：Token 列表 (手风琴) */}
      <div className="space-y-4 min-h-[500px]">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No tokens found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {paginatedData.map((signal) => {
              let llmReport: ParsedLlmReport | null = null;
              if (signal.llm_report) {
                try { llmReport = JSON.parse(signal.llm_report); } 
                catch (e) { console.error("Parse error", e); }
              }

              const tech = signal.components.technical_bias.details;
              const vol = signal.components.volume_trend.details;
              const mev = signal.components.mev_toxicity.details;
              const scores = signal.components;

              return (
                <AccordionItem 
                  key={signal.token_symbol} 
                  value={signal.token_symbol}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm px-0 overflow-hidden"
                >
                  {/* 🌟 巧妙的容器设计：将手风琴触发器与独立的订阅按钮并排放置，避免 DOM 嵌套报错 */}
                  <div className="flex items-center justify-between pr-5 bg-white hover:bg-gray-50/50 transition-colors">
                    {/* 把 flex-1 留给 Trigger */}
                    <AccordionTrigger className="flex-1 hover:no-underline py-5 pl-5 pr-4 border-none [&>svg]:ml-4">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3 w-24">
                          <span className={`w-3 h-3 rounded-full ${getColorClasses(signal.signal_color)} shadow-sm`} />
                          <span className="font-bold text-lg text-gray-900">{signal.token_symbol}</span>
                        </div>
                        <span className="text-gray-600 font-medium w-28 text-left tabular-nums">
                          ${signal.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </span>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50 font-semibold px-3">
                          {signal.total_score}/100
                        </Badge>
                        {llmReport && (
                          <Badge variant="outline" className="text-gray-500 border-gray-200 uppercase tracking-wider text-xs">
                            {llmReport.bias}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                  </div>
                  
                  {/* 下方折叠的分析面板 (与之前保持完全一致) */}
                  <AccordionContent className="pt-2 pb-6 px-5 border-t border-gray-100">
                    <Tabs defaultValue="ai-brief" className="w-full mt-4">
                      <TabsList className="mb-6 bg-gray-100/50">
                        <TabsTrigger value="ai-brief">AI Brief</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                        <TabsTrigger value="on-chain">On-chain</TabsTrigger>
                        <TabsTrigger value="score">Score</TabsTrigger>
                      </TabsList>

                      <TabsContent value="ai-brief">
                        <Card className="p-6 bg-gray-50/50 space-y-6 shadow-none border-gray-200">
                          {llmReport ? (
                            <>
                              <h3 className="font-semibold text-gray-900 text-lg flex items-center space-x-2">
                                <span>{signal.token_symbol} 1H Technical Brief ·</span>
                                <span className={llmReport.bias === 'BULLISH' ? 'text-green-600' : llmReport.bias === 'BEARISH' ? 'text-red-600' : 'text-yellow-600'}>
                                  {llmReport.bias}
                                </span>
                              </h3>
                              <p className="text-gray-700 leading-relaxed">{llmReport.summary}</p>
                              
                              <div className="space-y-5">
                                {llmReport.bearish_factors?.length > 0 && (
                                  <div>
                                    <div className="flex items-center space-x-2 font-semibold text-gray-900 mb-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                      <span>Bearish signals</span>
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-1">
                                      {llmReport.bearish_factors.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {llmReport.bullish_factors?.length > 0 && (
                                  <div>
                                    <div className="flex items-center space-x-2 font-semibold text-gray-900 mb-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                      <span>Bullish signals</span>
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 ml-1">
                                      {llmReport.bullish_factors.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="pt-4 border-t border-gray-200 text-sm bg-white/50 p-3 rounded-lg mt-4 inline-block">
                                <span className="font-semibold text-gray-900">Support:</span> ${llmReport.support_levels?.join(' / $')} <span className="mx-2 text-gray-300">|</span> 
                                <span className="font-semibold text-gray-900">Resistance:</span> ${llmReport.resistance_levels?.join(' / $')}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-400 text-sm">LLM Report processing...</div>
                          )}
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="technical">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">EMA Alignment</div>
                            <div className="font-semibold text-gray-900 mb-1">{tech?.ma_alignment || "Tangled"}</div>
                            <div className="text-sm text-gray-600 capitalize">{tech?.ma_trend?.replace('_', ' ')}</div>
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">MACD (12,26,9)</div>
                            <div className="font-semibold text-gray-900 mb-1 capitalize">{tech?.macd_position?.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-gray-600 capitalize">{tech?.macd_histogram_trend?.replace('_', ' ')}</div>
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">RSI (14)</div>
                            <div className={`font-semibold mb-1 ${(tech?.rsi_value || 50) > 70 ? 'text-red-600' : (tech?.rsi_value || 50) < 30 ? 'text-green-600' : 'text-gray-900'}`}>
                              {tech?.rsi_value?.toFixed(1)} — <span className="capitalize">{tech?.rsi_zone}</span>
                            </div>
                            {tech?.macd_divergence && tech.macd_divergence !== "None" && (
                               <Badge variant="outline" className="bg-orange-50 text-orange-700 mt-1"><AlertTriangle className="w-3 h-3 mr-1"/> {tech.macd_divergence}</Badge>
                            )}
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Support / Resistance (BB)</div>
                            <div className="font-semibold text-gray-900 mb-1">
                              ${tech?.bollinger_support?.toLocaleString(undefined, {maximumFractionDigits:4})} / ${tech?.bollinger_resistance?.toLocaleString(undefined, {maximumFractionDigits:4})}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">{tech?.bollinger_pattern?.replace('_', ' ')}</div>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="on-chain">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">24h Volume (DEX)</div>
                            <div className="font-semibold text-gray-900 text-xl mb-1">${vol?.volume_24h_usd?.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                            <div className="text-sm text-gray-500">{vol?.tx_count_24h} swaps</div>
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">7D Avg Volume</div>
                            <div className="font-semibold text-gray-900 text-xl mb-1">${vol?.volume_7d_avg_usd?.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                            <div className="text-sm text-gray-500">Daily average</div>
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Volume Ratio</div>
                            <div className={`font-semibold text-xl mb-1 ${(vol?.ratio || 0) > 1.2 ? 'text-green-600' : (vol?.ratio || 0) < 0.5 ? 'text-red-600' : 'text-gray-900'}`}>
                              {vol?.ratio?.toFixed(2)}x
                            </div>
                            <div className="text-sm text-gray-500">{(vol?.ratio || 0) > 1 ? "Expanding" : "Shrinking"}</div>
                          </Card>
                          <Card className="p-5 shadow-none border-gray-200">
                            <div className="text-sm text-gray-500 mb-1 flex items-center justify-between">
                              <span>MEV Toxicity</span>
                              <ShieldCheck className="w-4 h-4 text-gray-400"/>
                            </div>
                            <div className={`font-semibold text-xl mb-1 ${(mev?.toxicity_pct || 0) > 20 ? 'text-red-600' : 'text-gray-900'}`}>
                              {mev?.toxicity_pct?.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">{mev?.mev_suspicious_txs} / {mev?.mev_total_txs} Sandwich detected</div>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="score">
                        <Card className="p-6 shadow-none border-gray-200">
                          <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-gray-100">
                            <div className={`text-5xl font-bold ${getTextColor(signal.signal_color)}`}>
                              {signal.total_score}
                            </div>
                            <div className="text-gray-500 mt-2 font-medium tracking-wide uppercase">
                              Overall Signal Score
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Technical Analysis</span>
                                <span className="font-semibold">{scores?.technical_bias?.score || 0} / 30</span>
                              </div>
                              <Progress value={((scores?.technical_bias?.score || 0) / 30) * 100} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Volume Trend</span>
                                <span className="font-semibold">{scores?.volume_trend?.score || 0} / 15</span>
                              </div>
                              <Progress value={((scores?.volume_trend?.score || 0) / 15) * 100} className="h-2" />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">MEV Toxicity Safety</span>
                                <span className="font-semibold">{scores?.mev_toxicity?.score || 0} / 25</span>
                              </div>
                              <Progress value={((scores?.mev_toxicity?.score || 0) / 25) * 100} className="h-2" />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Contract Safety</span>
                                <span className="font-semibold">{scores?.contract_safety?.score || 0} / 30</span>
                              </div>
                              <Progress value={((scores?.contract_safety?.score || 0) / 30) * 100} className="h-2" />
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* 底部：分页控制器 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center pb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

    </div>
  );
}