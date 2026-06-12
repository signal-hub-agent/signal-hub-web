import { useState, useEffect, useCallback } from "react";
import { AlertMessage } from "../types/alerts"; 
import { useSession } from "next-auth/react";

export interface SubscriptionItem {
  target_id: string;
  target_type: string;
  created_at: string;
}

export function useAlerts() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.email) return;

      setIsLoading(true);
      try {
        // 并行拉取告警历史和订阅列表
        const [alertsRes, subsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/alerts/history?user_email=${session.user.email}`),
          fetch(`http://localhost:8000/api/v1/alerts/subscriptions?user_email=${session.user.email}`)
        ]);

        if (alertsRes.ok && subsRes.ok && isMounted) {
          const alertsData = await alertsRes.json();
          const subsData = await subsRes.json();
          setAlerts(alertsData);
          setSubscriptions(subsData);
        }
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [status, session?.user?.email]);

  return { alerts, subscriptions, isLoading };
}