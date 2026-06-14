import { KpiCards } from "@/components/dashboard/KpiCards";
import { LiveStream } from "@/components/dashboard/LiveStream";
import { TokenRadar } from "@/components/dashboard/TokenRadar";
import { SmartMoney } from "@/components/dashboard/SmartMoney";

export const metadata = {
  title: "Signal Hub | Minimalist AI Command Center",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/30">
      <main className="container mx-auto px-4 py-8 max-w-[1400px]">
        
        {/* 页面标题区 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time on-chain signals and AI-driven data analysis</p>
        </div>

        {/* 顶部 KPI 行 */}
        <div className="mb-8">
          <KpiCards />
        </div>

        {/* 核心布局：等宽三等分，完美对齐 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左翼：AI Token Radar */}
          <div className="w-full">
            <TokenRadar />
          </div>

          {/* 中枢：Live Stream */}
          <div className="w-full">
            <LiveStream />
          </div>

          {/* 右翼：Smart Money Detective */}
          <div className="w-full">
            <SmartMoney />
          </div>
        </div>
      </main>
    </div>
  );
}