// src/hooks/useAlerts.ts
import { useState, useEffect } from "react";
import { AlertMessage } from "../types/alerts"; // 使用相对路径以防别名解析失败
import { useSession } from "next-auth/react";

export function useAlerts() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 我们把逻辑直接写在 useEffect 里，这是 React 官方推荐的模式
  useEffect(() => {
    let isMounted = true; // 添加一个哨兵变量，防止组件卸载后更新状态

    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.email) return;

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/alerts/history?user_email=${session.user.email}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        
        if (isMounted) {
          setAlerts(data);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; }; // 清理函数
  }, [status, session?.user?.email]); // 只有当这两个值变动时才重新请求

  return { alerts, isLoading, refetch: () => {/* 如果需要手动触发，可以在这里添加逻辑 */} };
}