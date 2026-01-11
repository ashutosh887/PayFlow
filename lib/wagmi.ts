'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia } from 'wagmi/chains'
import { http } from 'wagmi'
import type { Config } from 'wagmi'

let wagmiConfig: Config | null = null

export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
    
    wagmiConfig = getDefaultConfig({
      appName: 'PayFlow',
      projectId: projectId || 'default',
      chains: [mainnet, sepolia] as any,
      ssr: true,
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
    }) as Config
  }
  return wagmiConfig
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getWagmiConfig>
  }
}
