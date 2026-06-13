// src/app/detective/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTop100Traders } from "@/hooks/useTop100Traders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, BellRing, Target, Trophy } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// 1. 👇 引入刚才新写的弹窗组件 👇
import { SubscribeModal } from "@/components/SubscribeModal";

// 格式化地址为 0x1234...5678
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// 智能分配 Tag 颜色
const getTagColor = (tag: string) => {
  if (tag.includes("Whale")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (tag.includes("Frequency")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (tag.includes("Win Rate")) return "bg-green-100 text-green-700 border-green-200";
  if (tag.includes("Risk") || tag.includes("Retail")) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

export default function DetectiveListPage() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useTop100Traders();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // 2. 👇 必须把 Modal 的状态放在组件函数内部 👇
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscribingAddress, setSubscribingAddress] = useState("");
  
  const ITEMS_PER_PAGE = 10;

  // 模糊搜索过滤逻辑
  const filteredTraders = useMemo(() => {
    if (!data?.traders) return [];
    return data.traders.filter((trader) => {
      const matchAddr = trader.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = trader.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchAddr || matchTag;
    });
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredTraders.length / ITEMS_PER_PAGE) || 1;
  const paginatedTraders = filteredTraders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 3. 👇 重写订阅逻辑：不再直接 fetch，而是弹窗 👇
  const triggerSubscribe = (addressToSubscribe: string) => {
    if (!session?.user?.email) {
      alert("Please log in with your Google account via the top right corner first!");
      return;
    }
    // 记录当前点击的地址，并打开弹窗
    setSubscribingAddress(addressToSubscribe);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center space-x-2"><Activity className="animate-spin w-5 h-5"/> <span>Radar scanning Top 100 Smart Money addresses...</span></div>;
  if (error) return <div className="p-8 text-red-500">Failed to load data: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* 顶部搜索栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-2">
          <Target className="text-blue-600 w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Top 100 Smart Money</h1>
        </div>
        
        <div className="relative w-full md:w-96 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search address or tags (e.g. Whale)..."
            className="pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 列表区 */}
      <div className="space-y-4 min-h-[500px]">
        {paginatedTraders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No addresses found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          paginatedTraders.map((trader, idx) => {
            const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
            return (
              <div key={trader.address} className="bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all flex items-stretch">
                
                {/* 🌟 左侧：占满剩余空间的跳转区域 */}
                <Link href={`/detective/${trader.address}`} className="flex-1 flex items-center justify-between p-5 pr-8">
                  <div className="flex items-center space-x-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rank <= 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      {rank <= 3 ? <Trophy className="w-5 h-5"/> : `#${rank}`}
                    </div>
                    
                    <div>
                      <div className="font-mono text-lg font-bold text-gray-900 mb-1">{formatAddress(trader.address)}</div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Win Rate: <span className="font-semibold text-gray-900">{trader.win_rate.toFixed(1)}%</span></span>
                        <span>Volume (30D): <span className="font-semibold text-gray-900">${(trader.total_volume_30d / 1000000).toFixed(1)}M</span></span>
                      </div>
                    </div>

                    <div className="hidden md:flex space-x-2 ml-4">
                      {trader.tags.map(tag => (
                        <Badge key={tag} variant="outline" className={`${getTagColor(tag)} border`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Copy Score */}
                  <div className="flex flex-col items-center justify-center">
                     <span className="text-2xl font-black text-gray-900">{trader.composite_score}</span>
                     <span className="text-xs font-medium text-gray-500 uppercase">Score</span>
                  </div>
                </Link>

                {/* 🌟 右侧：被一条细线隔开的独立按钮区域 */}
                <div className="pl-6 pr-5 flex items-center justify-center border-l border-gray-100">
                  <Button 
                    variant="default" 
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 shadow-sm transition-transform hover:scale-105"
                    onClick={() => triggerSubscribe(trader.address)} // 4. 👇 改用新的触发函数 👇
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 分页控制器 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center pb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 5. 👇 在组件最外层挂载弹窗 👇 */}
      <SubscribeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetAddress={subscribingAddress}
        onSuccess={() => alert("✅ Alert rules configured successfully! Please proceed to the Alerts page to check the real-time monitoring.")}
      />

    </div>
  );
}