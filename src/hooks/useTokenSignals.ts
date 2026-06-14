// src/hooks/useTokenSignals.ts
import { useState, useEffect } from "react";
import { TokenSignalResponse } from "@/types/dashboard";

// 建议使用环境变量，如果没有则回退到本地地址
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"; 

export function useTokenSignals() {
  const [data, setData] = useState<TokenSignalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllSignals() {
      try {
        setIsLoading(true);
        setError(null);

        // 🌟 第一步：向后端动态获取所有可用的 Token 列表
        const listRes = await fetch(`${API_BASE_URL}/signal/available/tokens`);
        if (!listRes.ok) {
          throw new Error("Failed to fetch available tokens list");
        }
        const tokens: string[] = await listRes.json();

        // 如果数据库里目前没有任何代币，直接返回空数组
        if (!tokens || tokens.length === 0) {
          setData([]);
          setIsLoading(false);
          return;
        }

        // 🌟 第二步：根据获取到的动态列表，并发请求每个代币的详细 Signal 数据
        const promises = tokens.map((token) =>
          fetch(`${API_BASE_URL}/signal/${token}`)
            .then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch ${token}`);
              return res.json();
            })
            .catch((err) => {
              // 容错处理：如果某个代币的数据报错(比如 LLM 超时)，只在控制台打印，不影响其他 29 个代币的展示
              console.warn(`Skipping token ${token} due to error:`, err);
              return null; 
            })
        );
        
        // 等待所有请求完成
        const results = await Promise.all(promises);
        
        // 过滤掉因为报错返回 null 的数据，并将成功的数据存入状态
        const validResults = results.filter((item) => item !== null);
        setData(validResults);

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