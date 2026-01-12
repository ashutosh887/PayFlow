'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { CONTRACT_ADDRESSES, areContractsDeployed } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { FLOW_FACTORY_ABI } from '@/lib/contracts'

export function ContractStatus() {
  const contractsDeployed = areContractsDeployed()
  
  const { data: flowCount, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FLOW_FACTORY,
    abi: FLOW_FACTORY_ABI,
    functionName: 'getFlowCount',
    query: {
      enabled: contractsDeployed && !!CONTRACT_ADDRESSES.FLOW_FACTORY,
    },
  })

  if (!contractsDeployed) {
    return (
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Contracts not configured</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Contracts Deployed</span>
        </div>
        {!isLoading && (
          <Badge variant="outline">
            {flowCount ? Number(flowCount) : 0} flows
          </Badge>
        )}
      </div>
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div>Factory: {CONTRACT_ADDRESSES.FLOW_FACTORY?.slice(0, 10)}...</div>
        <div>Manager: {CONTRACT_ADDRESSES.APPROVAL_MANAGER?.slice(0, 10)}...</div>
      </div>
    </Card>
  )
}
