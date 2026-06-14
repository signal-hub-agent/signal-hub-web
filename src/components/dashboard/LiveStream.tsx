"use client";

import { useEffect, useState, useRef } from "react";
import { AlertMessage, truncateAddress, formatCurrency } from "@/lib/dashboard-api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioTower } from "lucide-react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

const getEventColor = (type: string) => {
  switch (type) {
    case "ZERO_DAY": return "bg-red-50 text-red-700 border-red-200";
    case "SMART_SWAP": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "WHALE_MOVEMENT": return "bg-blue-50 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour12: false });
};

export function LiveStream() {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/dashboard/stream`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const newAlert: AlertMessage = JSON.parse(event.data);
          setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
        } catch (err) {}
      };
      ws.onclose = () => { reconnectTimeout = setTimeout(connect, 3000); };
    };
    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <Card className="h-[750px] flex flex-col shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
      {/* 统一规范的标题栏 */}
      <CardHeader className="pb-4 pt-5 px-5 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center space-x-2">
          <RadioTower className="h-5 w-5 text-indigo-600 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Global Live Stream</h2>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50/30 scrollbar-hide">
        <div className="divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 mt-10">Waiting for real-time on-chain signals...</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.event_id} className="p-4 hover:bg-white transition-colors animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">{formatTime(alert.timestamp)}</span>
                  <Badge variant="outline" className={`${getEventColor(alert.event_type)} border`}>
                    {alert.event_type.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-slate-600">{truncateAddress(alert.target_address)}</span>
                  <span className="font-semibold text-slate-900">
                    {alert.data.usd_value ? formatCurrency(Number(alert.data.usd_value)) : "--"}
                  </span>
                </div>
                {alert.data.token_symbol && (
                  <div className="mt-1 text-xs text-slate-500">
                    Action: <span className="font-medium text-slate-700">{alert.data.flow_direction || "Interact"}</span> with {alert.data.token_symbol}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}