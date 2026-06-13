// src/app/detective/[address]/page.tsx
"use client";
import { use } from "react";
import { AddressDetailResponse, RecentTrade } from "@/types/detective";
import { useAddressDetective } from "@/hooks/useAddressDetective";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Activity, BellRing, Copy, ShieldAlert } from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";



// 格式化地址为 0x1234...5678
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// 🌟 接收动态路由参数 params
export default function AddressDetectivePage({ params }: { params: Promise<{ address: string }> }) {
  // 🌟 核心修复：使用 React.use() 解包 params 拿到真实的 address
  const { address } = use(params);
  // 🌟 使用路由里的真实地址，删掉原先 hardcode 的 testAddress
  const { data, isLoading, error } = useAddressDetective(address);

  if (isLoading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center space-x-2"><Activity className="animate-spin w-5 h-5"/> <span>Deep scanning on-chain address...</span></div>;
  if (error || !data) return <div className="p-8 text-red-500">Scan failed: {error}</div>;

  // 🌟 核心修复：解构嵌套了两次的 LLM 包装层
  const metrics = data.metrics;
  const tags = data.tags;
  const composite_score = data.composite_score;
  
  // 这里的 data.llm_analysis 实际上是后端返回的那个巨大 Dict
  type WrappedLlmData = {
    llm_analysis?: {
      profile_report?: string;
      style_label?: string;
      copy_suggestion?: string;
    };
    // 🌟 修复：明确告诉 TS 里面装的是 RecentTrade 结构
    recent_trades?: RecentTrade[]; 
    trade_quality?: {
      avg_entry_sfs?: number | null;
    };
  };
  const wrapper = data.llm_analysis as WrappedLlmData | null;
  // 真实的 AI 报告内容在第二层
  const llmReportObj = wrapper?.llm_analysis;
  const llmReportText = llmReportObj?.profile_report;
  const styleLabel = llmReportObj?.style_label || "Unknown Trader";
  const copySuggestion = llmReportObj?.copy_suggestion;
  
  // 交易流水和质量数据
  const recentTrades = wrapper?.recent_trades || [];
  const tradeQuality = wrapper?.trade_quality;

  // 动态构建雷达图数据
  const radarData = [
    { subject: 'Win Rate', A: metrics ? metrics.win_rate : 0, fullMark: 100 },
    { subject: 'P/L Ratio', A: metrics ? Math.min((metrics.profit_loss_ratio / 3) * 100, 100) : 0, fullMark: 100 },
    { subject: 'Risk', A: metrics ? Math.max(100 - (Math.abs(metrics.max_drawdown) * 2), 0) : 0, fullMark: 100 },
    { subject: 'Consistency', A: metrics ? Math.min((metrics.active_days_30d / 30) * 100, 100) : 0, fullMark: 100 },
    // 🌟 修复 Timing 0 的问题
    { subject: 'Timing', A: tradeQuality?.avg_entry_sfs || 0, fullMark: 100 }, 
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* 头部信息卡片 */}
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex space-x-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
              W1
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                {/* 🌟 正确读取 LLM 标签 */}
                <span>{styleLabel}</span>
              </h1>
              <div className="flex items-center space-x-2 text-gray-500 mt-1">
                <span className="font-mono">{formatAddress(data.address)}</span>
                <Copy className="w-4 h-4 cursor-pointer hover:text-gray-800" />
              </div>
              <div className="flex space-x-2 mt-3">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="w-20 h-20 rounded-full border-4 border-orange-400 flex items-center justify-center text-2xl font-bold text-gray-900">
              {composite_score}
            </div>
            <span className="text-gray-500 text-sm mt-2 font-medium">Copy Score</span>
          </div>
        </div>
      </Card>

      {/* 雷达图与核心财务指标 */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Trading ability radar</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip />
                <Radar name="Trader" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-6 text-lg">Financial metrics (30D)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-gray-500 text-sm mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">{metrics?.win_rate.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-gray-500 text-sm mb-1">P/L Ratio</div>
              <div className="text-2xl font-bold text-gray-900">{metrics?.profit_loss_ratio.toFixed(1)}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <div className="text-red-500 text-sm mb-1">Max DD</div>
              {/* 🌟 修复双负号 Bug */}
              <div className="text-2xl font-bold text-red-600">{metrics?.max_drawdown.toFixed(1)}%</div>
            </div>
           <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-gray-500 text-sm mb-1">Volume</div>
              <div className="text-2xl font-bold text-gray-900">${((metrics?.total_volume_usd || 0)/1000000).toFixed(1)}M</div>
            </div>
          </div>
        </Card>
      </div>

      {/* LLM AI 深度分析报告 */}
      <Card className="p-6 shadow-sm border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Full AI analysis</h3>
        {/* 🌟 正确渲染 AI 分析文本 */}
        <p className="text-gray-700 leading-relaxed text-base">
          {llmReportText || "No profile report generated for this address yet."}
        </p>
        {copySuggestion && (
          <div className="mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50/50 text-yellow-800 italic rounded-r-lg flex items-start space-x-3">
             <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
             <span>{copySuggestion}</span>
          </div>
        )}
      </Card>

      {/* 近期交易流水 (带 SFS 时机评分) */}
      <Card className="p-6 shadow-sm border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-6 text-lg">Recent trades (last 15)</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Amount (USD)</TableHead>
                <TableHead>SFS at entry</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrades.map((trade, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-gray-600">{new Date(trade.time).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={trade.direction === 'buy' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                      {trade.direction.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{trade.token}</TableCell>
                  <TableCell className="text-gray-600">${trade.amount_usd.toLocaleString()}</TableCell>
                  <TableCell>
                    {trade.direction === 'buy' && trade.token_signal?.sfs_score != null ? (
                        <Badge variant="secondary" className={trade.token_signal.sfs_score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        SFS {trade.token_signal.sfs_score}
                        </Badge>
                    ) : <span className="text-gray-400">—</span>}
                </TableCell>
                  <TableCell className="text-gray-600 capitalize">
                    {trade.direction === 'buy' ? trade.token_signal?.trend_type?.replace('_', ' ') || 'Unknown' : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {recentTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-6">No recent trades found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* 订阅跟单按钮 */}
        <div className="mt-8 flex justify-center">
           <Button size="lg" className="px-12 py-6 text-lg rounded-full shadow-lg shadow-blue-500/20 bg-gray-900 hover:bg-gray-800 flex items-center space-x-3 transition-transform hover:scale-105">
              <BellRing className="w-5 h-5" />
              <span>Subscribe to Signals</span>
           </Button>
        </div>
      </Card>
      
    </div>
  );
}