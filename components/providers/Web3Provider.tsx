"use client"

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getWagmiConfig } from '@/lib/wagmi'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export function Web3Provider({ 
  children
}: { 
  children: ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<ReturnType<typeof getWagmiConfig> | null>(null)

  useEffect(() => {
    setMounted(true)
    setConfig(getWagmiConfig())
  }, [])

  if (!mounted || !config) {
    return (
      <WagmiProvider config={getWagmiConfig()}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
