'use client'

import { Card } from '@/components/ui/card'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { areContractsDeployed } from '@/lib/contracts'
import Link from 'next/link'

export function ContractDeploymentNotice() {
  if (areContractsDeployed()) {
    return null
  }

  return (
    <Card className="p-4 bg-yellow-500/10 border-yellow-500/20 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-600 mb-1">Contracts Not Deployed</h3>
          <p className="text-sm text-yellow-600/80 mb-2">
            The smart contracts need to be deployed before you can use PayFlow. Please deploy the
            contracts first.
          </p>
          <p className="text-xs text-yellow-600/60">
            See <code className="bg-yellow-500/20 px-1 rounded">Contracts.md</code> for deployment
            instructions.
          </p>
        </div>
      </div>
    </Card>
  )
}
