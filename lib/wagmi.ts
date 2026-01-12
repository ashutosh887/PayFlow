'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia } from 'wagmi/chains'
import { http, createConfig } from 'wagmi'
import type { Config } from 'wagmi'

let wagmiConfig: Config | null = null

export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    if (typeof window === 'undefined') {
      wagmiConfig = createConfig({
        chains: [mainnet, sepolia],
        transports: {
          [mainnet.id]: http(),
          [sepolia.id]: http(),
        },
      }) as Config
      return wagmiConfig
    }

    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
    
    if (!projectId) {
    }

    wagmiConfig = getDefaultConfig({
      appName: 'PayFlow',
      projectId: projectId || '00000000000000000000000000000000',
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
