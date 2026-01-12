"use client"

export const dynamic = 'force-dynamic'

import { FlowCard } from '@/components/dashboard/FlowCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useFlowsByOwner } from '@/hooks/useFlowFactory'
import { useFlowData } from '@/hooks/usePaymentFlow'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { ContractDeploymentNotice } from '@/components/common/ContractDeploymentNotice'
import { NetworkWarning } from '@/components/common/NetworkWarning'
import { ContractStatus } from '@/components/common/ContractStatus'
import { areContractsDeployed } from '@/lib/contracts'
import { getFlowMetadata } from '@/lib/flowMetadata'
import { usePendingApprovals } from '@/hooks/usePendingApprovals'
import { PendingApprovalCard } from '@/components/dashboard/PendingApprovalCard'
import { useApprovalStatus } from '@/hooks/useApprovalManager'

function FlowCardWrapper({ flowAddress }: { flowAddress: string }) {
  const { status, totalAmount, remainingAmount, flowType, isLoading } = useFlowData(
    flowAddress as `0x${string}`
  )

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </Card>
    )
  }

  const statusMap: Record<number, 'active' | 'paused' | 'completed'> = {
    0: 'active',
    1: 'paused',
    2: 'completed',
    3: 'completed',
  }

  const flowTypeMap: Record<number, string> = {
    0: 'Milestone Payment',
    1: 'Revenue Split',
    2: 'Recurring Payment',
    3: 'Escrow',
  }

  const metadata = getFlowMetadata(flowAddress)
  const flowName = metadata?.name || `Flow ${flowAddress.slice(0, 6)}...${flowAddress.slice(-4)}`

  return (
    <FlowCard
      id={flowAddress}
      name={flowName}
      status={statusMap[status] || 'active'}
      totalAmount={formatUnits(totalAmount, 18)}
      remainingAmount={formatUnits(remainingAmount, 18)}
      type={flowTypeMap[flowType] || 'Payment Flow'}
    />
  )
}

function PendingApprovalWrapper({ approvalId }: { approvalId: number }) {
  const { approvalCount, requiredApprovals } = useApprovalStatus(approvalId)
  
  return (
    <PendingApprovalCard
      id={approvalId.toString()}
      flowName={`Approval #${approvalId}`}
      amount="Pending"
      recipient="0x0000...0000"
      required={requiredApprovals}
      current={approvalCount}
    />
  )
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const contractsDeployed = areContractsDeployed()
  const { flows, isLoading, error, refetch } = useFlowsByOwner()
  const { pendingApprovals } = usePendingApprovals()

  useEffect(() => {
    if (isConnected && address && contractsDeployed) {
      refetch()
    }
  }, [address, isConnected, contractsDeployed, refetch])

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage your payment flows</p>
        <Link href="/app/flows/new">
          <Button disabled={!areContractsDeployed()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
        </Link>
      </div>
      <div className="pt-6 space-y-6 px-4">

      <NetworkWarning />
      <ContractDeploymentNotice />
      {contractsDeployed && <ContractStatus />}

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
            <div className="space-y-6">
              {pendingApprovals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingApprovals.map((approval) => (
                      <PendingApprovalWrapper key={approval.approvalId} approvalId={approval.approvalId} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-4">My Flows</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
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
            </div>
          )}


          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">View detailed activity in the Activity page</p>
                <Link href="/app/activity" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">View All Activity</Button>
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
