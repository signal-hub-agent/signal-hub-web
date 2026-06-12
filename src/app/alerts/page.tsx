"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAlerts } from "@/hooks/useAlerts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, ShieldAlert, Clock, Plus } from "lucide-react";

export default function AlertsPage() {
  const { data: session } = useSession();
  const { alerts, isLoading, refetch } = useAlerts();
  
  const [targetId, setTargetId] = useState("");
  const [targetType, setTargetType] = useState("ADDRESS");

  const handleSubscribe = async () => {
    if (!session?.user?.email) return alert("请先登录");
    
    await fetch("http://localhost:8000/api/v1/alerts/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: targetId,
        target_type: targetType,
        user_email: session.user.email
      })
    });
    setTargetId("");
    refetch(); // 刷新列表
  };

  if (!session) return <div className="p-10 text-center">请登录以查看告警</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <Bell className="text-indigo-600 w-8 h-8" />
        <h1 className="text-3xl font-bold">Subscription Alerts</h1>
      </div>

      {/* 订阅面板 */}
      <Card className="p-4 mb-8 flex gap-2">
        <Input 
          placeholder="输入代币符号或钱包地址..." 
          value={targetId} 
          onChange={(e) => setTargetId(e.target.value)}
        />
        <Select value={targetType} onValueChange={setTargetType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADDRESS">Address</SelectItem>
            <SelectItem value="TOKEN">Token</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSubscribe}><Plus className="w-4 h-4 mr-2"/>订阅</Button>
      </Card>

      {/* 告警列表 */}
      <div className="space-y-4">
        {isLoading ? <div>加载中...</div> : alerts.map((alert) => (
          <Card key={alert.alert_id} className="p-4 flex items-start space-x-4 border-l-4 border-l-indigo-500">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold">{alert.message}</p>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}