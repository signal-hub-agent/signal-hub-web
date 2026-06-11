// src/hooks/useAddressDetective.ts
import { useState, useEffect } from "react";
import { AddressDetailResponse } from "@/types/detective";

const API_BASE_URL = "http://localhost:8000/api/v1";

export function useAddressDetective(address: string) {
  const [data, setData] = useState<AddressDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchAddress() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/detective/search/${address}`);
        if (!res.ok) throw new Error(`Failed to fetch address data: ${res.statusText}`);
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAddress();
  }, [address]);

  return { data, isLoading, error };
}