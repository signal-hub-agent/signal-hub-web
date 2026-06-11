// src/hooks/useTokenSignals.ts
import { useState, useEffect } from "react";
import { TokenSignalResponse } from "@/types/dashboard";

const TOKENS_TO_FETCH = ["ETH", "BTC", "SOL", "MNT"];
// 替换为你的 FastAPI 实际运行地址
const API_BASE_URL = "http://localhost:8000/api/v1"; 

export function useTokenSignals() {
  const [data, setData] = useState<TokenSignalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllSignals() {
      try {
        setIsLoading(true);
        // 并发请求所有配置的 Token
        const promises = TOKENS_TO_FETCH.map((token) =>
          fetch(`${API_BASE_URL}/signal/${token}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${token}`);
            return res.json();
          })
        );
        const results = await Promise.all(promises);
        setData(results);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllSignals();
  }, []);

  return { data, isLoading, error };
}