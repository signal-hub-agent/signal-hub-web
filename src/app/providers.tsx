// src/app/providers.tsx
'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css'; 

import { config } from '@/lib/web3-config';

// 初始化 React Query 
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({
          accentColor: '#000000', 
          accentColorForeground: 'white',
          borderRadius: 'large', 
          fontStack: 'system',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}