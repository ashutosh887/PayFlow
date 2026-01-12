"use client"

export const dynamic = 'force-dynamic'

import { FlowCard } from '@/components/dashboard/FlowCard'
import { PendingApprovalCard } from '@/components/dashboard/PendingApprovalCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useFlowsByOwner } from '@/hooks/useFlowFactory'
import { useFlowData } from '@/hooks/usePaymentFlow'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { ContractDeploymentNotice } from '@/components/common/ContractDeploymentNotice'
import { areContractsDeployed } from '@/lib/contracts'

function FlowCardWrapper({ flowAddress }: { flowAddress: string }) {
  const { status, totalAmount, remainingAmount, flowType, isLoading } = useFlowData(
    flowAddress as `0x${string}`
  )

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const statusMap: Record<number, 'active' | 'paused' | 'completed'> = {
    0: 'active',
    1: 'paused',
    2: 'completed',
    3: 'completed', // cancelled
  }

  const flowTypeMap: Record<number, string> = {
    0: 'Milestone Payment',
    1: 'Revenue Split',
    2: 'Recurring Payment',
    3: 'Escrow',
  }

  return (
    <FlowCard
      id={flowAddress}
      name={`Flow ${flowAddress.slice(0, 6)}...${flowAddress.slice(-4)}`}
      status={statusMap[status] || 'active'}
      totalAmount={formatUnits(totalAmount, 18)}
      remainingAmount={formatUnits(remainingAmount, 18)}
      type={flowTypeMap[flowType] || 'Payment Flow'}
    />
  )
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const contractsDeployed = areContractsDeployed()
  const { flows, isLoading, error, refetch } = useFlowsByOwner()
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])

  useEffect(() => {
    if (isConnected && address && contractsDeployed) {
      refetch()
    }
  }, [address, isConnected, contractsDeployed, refetch])

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your payment flows</p>
        </div>
        <Link href="/app/flows/new">
          <Button disabled={!areContractsDeployed()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
        </Link>
      </div>
      <div className="pt-6 space-y-6 px-4">

      <ContractDeploymentNotice />

      {!isConnected && (
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to view your flows</p>
          </div>
        </Card>
      )}

      {isConnected && (
        <>
          {!contractsDeployed ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Contracts not configured</p>
                <p className="text-sm text-muted-foreground">
                  Please configure contract addresses in your environment variables
                </p>
              </div>
            </Card>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Flows</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-destructive mb-2">Error loading flows</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {error.message || 'Failed to fetch flows from contract'}
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </Card>
              ) : flows.length === 0 ? (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No flows found</p>
                    <Link href="/app/flows/new">
                      <Button>Create Your First Flow</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flows.map((flowAddress) => (
                    <FlowCardWrapper key={flowAddress} flowAddress={flowAddress} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Pending Approvals ({pendingApprovals.length})
            </h2>
            {pendingApprovals.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApprovals.map((approval) => (
                  <PendingApprovalCard key={approval.id} {...approval} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Activity will appear here as you use the app</p>
              </div>
            </Card>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
