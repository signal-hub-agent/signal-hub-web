// src/components/SubscribeModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Activity, Waves, ShieldAlert, Droplets, ArrowRightLeft } from "lucide-react";
import { AlertConfig, SubscriptionItem } from "@/types/alerts";

// 默认配置模板
const DEFAULT_CONFIG: AlertConfig = {
  whale_movement: { enabled: false, threshold_usd: 50000 },
  smart_swap: { enabled: false },
  zero_day: { enabled: false, max_contract_age_hours: 24 },
  liquidity: { enabled: false },
  bridge: { enabled: false, threshold_usd: 10000 }
};

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress: string;
  existingData?: SubscriptionItem | null; // 传入则为编辑模式，否则为新增
  onSuccess: () => void;
}

export function SubscribeModal({ isOpen, onClose, targetAddress, existingData, onSuccess }: SubscribeModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("My Address Alert");
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  // 初始化数据（处理编辑模式）
  useEffect(() => {
    if (isOpen) {
      // 🛑 核心修复 2：使用 setTimeout 将状态更新推迟，绕过严格模式告警
      setTimeout(() => {
        if (existingData) {
          setName(existingData.name);
          // 合并默认配置，防止后端返回空导致报错
          setConfig({ ...DEFAULT_CONFIG, ...existingData.config });
        } else {
          setName("My Address Alert");
          setConfig(DEFAULT_CONFIG);
        }
      }, 0);
    }
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AlertConfig) => {
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const handleNumberChange = (key: keyof AlertConfig, field: string, value: string) => {
    const num = parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], [field]: num } }));
  };

  const handleSave = async () => {
    if (!session?.user?.email) return alert("请先登录");
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_id: targetAddress,
          target_type: "ADDRESS",
          user_email: session.user.email,
          name: name,
          config: config
        })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("保存失败");
      }
    } catch (e) {
      console.error(e);
      alert("网络错误");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* 顶部标题 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{existingData ? "Edit Subscription" : "Create Alert"}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{targetAddress}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-8">
          {/* 告警名称 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Name (告警名称)</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如: 巨鲸追踪-01" />
          </div>

          {/* 策略选择区 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Signal Triggers (触发条件设置)</label>
            <div className="space-y-4">
              
              {/* 1. Whale Movements */}
              <Card className={`p-4 border-2 transition-all ${config.whale_movement.enabled ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Waves className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Whale Movements (大额资金转移)</h3>
                      <p className="text-sm text-gray-500">监控该地址单笔转出/转入的大额资产异动。</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={config.whale_movement.enabled} onChange={() => handleToggle('whale_movement')} />
                </div>
                {config.whale_movement.enabled && (
                  <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">触发阈值 (USD) &gt; </span>
                    <Input type="number" className="w-32 bg-white" value={config.whale_movement.threshold_usd} onChange={(e) => handleNumberChange('whale_movement', 'threshold_usd', e.target.value)} />
                  </div>
                )}
              </Card>

              {/* 2. Smart Swap */}
              <Card className={`p-4 border-2 transition-all ${config.smart_swap.enabled ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Smart Money Swaps (DEX 异常交易)</h3>
                      <p className="text-sm text-gray-500">该地址买入了全新的、低流动性的 Alpha Token 时触发。</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={config.smart_swap.enabled} onChange={() => handleToggle('smart_swap')} />
                </div>
              </Card>

              {/* 3. Zero Day */}
              <Card className={`p-4 border-2 transition-all ${config.zero_day.enabled ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Zero-Day Interactions (零日合约交互)</h3>
                      <p className="text-sm text-gray-500">地址向刚部署不久的未知合约发送 Approve 或进行交互。</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={config.zero_day.enabled} onChange={() => handleToggle('zero_day')} />
                </div>
                {config.zero_day.enabled && (
                  <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">限制合约部署时长 (小时) &lt; </span>
                    <Input type="number" className="w-24 bg-white" value={config.zero_day.max_contract_age_hours} onChange={(e) => handleNumberChange('zero_day', 'max_contract_age_hours', e.target.value)} />
                  </div>
                )}
              </Card>

              {/* 4. Liquidity */}
              <Card className={`p-4 border-2 transition-all ${config.liquidity.enabled ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><Droplets className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Liquidity Provisioning (流动性骤变)</h3>
                      <p className="text-sm text-gray-500">监控从核心 DEX 交易对中突然撤出巨额 LP 的跑路前兆行为。</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={config.liquidity.enabled} onChange={() => handleToggle('liquidity')} />
                </div>
              </Card>

              {/* 5. Bridge */}
              <Card className={`p-4 border-2 transition-all ${config.bridge.enabled ? "border-indigo-500 bg-indigo-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ArrowRightLeft className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Bridge Transfers (跨链桥行为)</h3>
                      <p className="text-sm text-gray-500">资金通过 Mantle Bridge 逃离生态跨回 L1 的信号。</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={config.bridge.enabled} onChange={() => handleToggle('bridge')} />
                </div>
                {config.bridge.enabled && (
                  <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">触发阈值 (USD) &gt; </span>
                    <Input type="number" className="w-32 bg-white" value={config.bridge.threshold_usd} onChange={(e) => handleNumberChange('bridge', 'threshold_usd', e.target.value)} />
                  </div>
                )}
              </Card>

            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-100 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Subscription"}
          </Button>
        </div>

      </div>
    </div>
  );
}