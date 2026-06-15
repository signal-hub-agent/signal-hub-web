"use client";

import * as React from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mantleSepoliaTestnet, mantle, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// 🌟 1. 引入 SessionProvider
import { SessionProvider } from "next-auth/react"; 
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Signal Hub",
  projectId: "7808052059e8aafdffae2219a83c5804",
  chains: [mantleSepoliaTestnet, mantle, mainnet],
  ssr: true,
});

const queryClient = new QueryClient();

// 🌟 2. 接收 session 参数
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider locale="en-US">
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}