// src/hooks/useTop100Traders.ts
import { useState, useEffect } from "react";
import { Top100Response } from "@/types/detective";

const API_BASE_URL = "http://localhost:8000/api/v1";

export function useTop100Traders() {
  const [data, setData] = useState<Top100Response | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTop100() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/detective/top100`);
        if (!res.ok) throw new Error("Failed to fetch top 100 traders");
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    }
    fetchTop100();
  }, []);

  return { data, isLoading, error };
}