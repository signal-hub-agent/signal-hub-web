"use client";

import * as React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mantle, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

const config = getDefaultConfig({
  appName: "Signal Hub",
  projectId: "7808052059e8aafdffae2219a83c5804", // 生产环境需要去 WalletConnect 申请，本地测试可随便填或留默认
  chains: [mantle, mainnet],
  ssr: true, // 开启 Next.js 的服务端渲染支持
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en-US">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}