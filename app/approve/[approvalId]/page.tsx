"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAccount } from 'wagmi'
import { Check, X, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function ApprovalPageRoute({
  params,
}: {
  params: { approvalId: string }
}) {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const approvalData = {
    flowName: 'Website Redesign Project',
    milestone: 'Development Phase',
    amount: '2,500',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    required: 2,
    current: 1,
    approvers: [
      { address: '0x891f...', approved: true, time: '2h ago' },
      { address: '0x456a...', approved: false },
      { address: '0x789b...', approved: false },
    ],
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(approvalData.recipient)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApprove = () => {
    if (!isConnected) return
  }

  const handleReject = () => {
    if (!isConnected) return
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Approval Request</h1>
          <p className="text-muted-foreground">Review and approve this payment</p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="text-sm text-muted-foreground">Flow</label>
            <p className="font-semibold">{approvalData.flowName}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Milestone</label>
            <p className="font-semibold">{approvalData.milestone}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Amount</label>
            <p className="text-2xl font-bold">{approvalData.amount} MNEE</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Recipient</label>
            <div className="flex items-center gap-2">
              <p className="font-mono">{approvalData.recipient}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Approval Status
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Required:</span>
                <Badge>{approvalData.required} of {approvalData.required} approvals</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Current:</span>
                <Badge variant="secondary">{approvalData.current} approved</Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {approvalData.approvers.map((approver, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-muted"
                >
                  <span className="text-sm font-mono">{approver.address}</span>
                  {approver.approved ? (
                    <Badge variant="outline" className="bg-green-500/10">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved {approver.time}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to approve or reject
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleApprove}
            >
              <Check className="h-5 w-5 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleReject}
            >
              <X className="h-5 w-5 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
