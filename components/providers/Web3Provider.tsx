"use client"

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { getWagmiConfig } from '@/lib/wagmi'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const customDarkTheme = darkTheme({
  accentColor: '#e8e8e8',
  accentColorForeground: '#363636',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
})

export function Web3Provider({ 
  children
}: { 
  children: ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)
  const config = getWagmiConfig() // Always get config, even during SSR

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always provide WagmiProvider, but only add RainbowKit after mount
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider 
            theme={customDarkTheme}
            modalSize="compact"
          >
            {children}
          </RainbowKitProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
