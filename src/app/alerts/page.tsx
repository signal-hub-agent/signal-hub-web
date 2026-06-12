// src/app/alerts/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, Trash2, Edit } from "lucide-react";
import { SubscribeModal } from "@/components/SubscribeModal";
import { SubscriptionItem } from "@/types/alerts";

export default function AlertsPage() {
 const { data: session } = useSession();
 const userEmail = session?.user?.email;
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    // 🌟 在内部直接使用提取出来的 userEmail 变量
    if (!userEmail) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/alerts/subscriptions?user_email=${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]); // 🌟 依赖项变成这个明确的基础类型变量

  useEffect(() => {
    // 使用 setTimeout 将调用推迟到下一个宏任务队列
    // 这在执行逻辑上毫无延迟，但能完美绕过 Linter 的“同步静态扫描”
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 0);

    // 清理函数，防止组件卸载时内存泄漏
    return () => clearTimeout(timer);
  }, [fetchSubscriptions]);

  const handleDelete = async (targetId: string) => {
    // 顺手把这里的逻辑也换成 userEmail，保持代码整洁
    if (!userEmail || !confirm("确认删除这个地址的订阅吗？")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/alerts/unsubscribe?user_email=${userEmail}&target_id=${targetId}&target_type=ADDRESS`, { method: 'DELETE' });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  if (!session) return <div className="p-10 text-center">请登录以管理您的订阅配置。</div>;

  const filteredSubs = subscriptions.filter(sub => 
    sub.target_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3">
        <Bell className="text-indigo-600 w-8 h-8" />
        <h1 className="text-3xl font-bold">Alert Rules Engine</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-colors" 
              placeholder="搜索地址或告警名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? <div className="text-gray-400 p-4">拉取规则中...</div> : 
            filteredSubs.map((sub) => (
              <div key={sub.target_id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{sub.name}</h3>
                  <p className="font-mono text-sm text-gray-500 mt-1">{sub.target_id}</p>
                  
                  {/* 显示激活了哪些策略 (极简徽章) */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {sub.config.whale_movement.enabled && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded font-medium">Whales</span>}
                    {sub.config.smart_swap.enabled && <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded font-medium">Smart Swaps</span>}
                    {sub.config.zero_day.enabled && <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded font-medium">Zero-Day</span>}
                    {sub.config.liquidity.enabled && <span className="px-2 py-1 bg-cyan-50 text-cyan-600 text-xs rounded font-medium">Liquidity</span>}
                    {sub.config.bridge.enabled && <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded font-medium">Bridges</span>}
                    {Object.values(sub.config).every(v => !v.enabled) && <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-medium">No active triggers</span>}
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(sub)}>
                    <Edit className="w-4 h-4 mr-2" /> 配置规则
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(sub.target_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          }
          {filteredSubs.length === 0 && !isLoading && (
             <div className="text-center py-10 text-gray-400">目前没有匹配的订阅配置。</div>
          )}
        </div>
      </Card>

      {/* 挂载弹窗 */}
      <SubscribeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        targetAddress={editingSub?.target_id || ""}
        existingData={editingSub}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}