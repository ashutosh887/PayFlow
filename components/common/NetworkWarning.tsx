'use client'

import { useAccount, useChainId } from 'wagmi'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { sepolia } from 'wagmi/chains'

export function NetworkWarning() {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected) return null

  const isSupported = chainId === sepolia.id || chainId === 1

  if (isSupported) return null

  return (
    <Card className="p-4 bg-yellow-500/10 border-yellow-500/20 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-600 mb-1">Unsupported Network</h3>
          <p className="text-sm text-yellow-600/80">
            Please switch to Sepolia or Mainnet to use PayFlow.
          </p>
        </div>
      </div>
    </Card>
  )
}
