// src/lib/web3-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mantle, mantleTestnet } from 'wagmi/chains';

// RainbowKit 和 Wagmi 的核心参数
export const config = getDefaultConfig({
  appName: 'Signal-Hub',
  projectId: 'Signal-Hub', 
  chains: [mantle, mantleTestnet],
  ssr: true, 
});