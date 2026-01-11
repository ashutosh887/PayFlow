"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAccount, useDisconnect } from 'wagmi'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { Copy, CheckCircle2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { openAccountModal } = useAccountModal()
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet</h2>
        {isConnected && address ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Connected Address</div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-muted rounded-md font-mono text-sm flex-1">
                  {address}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex gap-3">
              <Button variant="outline" onClick={openAccountModal}>
                Manage Wallet
              </Button>
              <Button variant="outline" onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            No wallet connected
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Notifications</div>
            <div className="text-sm">Email notifications for approvals and payments</div>
          </div>
          <Separator />
          <div>
            <div className="text-sm text-muted-foreground mb-2">Default Chain</div>
            <div className="text-sm">Ethereum Mainnet</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
  