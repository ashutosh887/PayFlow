"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAccount } from 'wagmi'
import { Check, X, Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useApprove, useApprovalStatus } from '@/hooks/useApprovalManager'
import { useRouter } from 'next/navigation'

export default function ApprovalPageRoute({
  params,
}: {
  params: { approvalId: string }
}) {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const approvalId = parseInt(params.approvalId)

  const { approvalCount, requiredApprovals, isApproved, isLoading: isLoadingStatus } =
    useApprovalStatus(isNaN(approvalId) ? undefined : approvalId)
  const { approve, isPending: isPendingApprove, isSuccess: isApproveSuccess, error } = useApprove(
    isNaN(approvalId) ? undefined : approvalId
  )

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApprove = async () => {
    if (!isConnected) return
    try {
      await approve()
    } catch {
    }
  }

  const handleReject = () => {
    router.push('/app')
  }

  if (isApproveSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Approval Successful!</h2>
            <p className="text-muted-foreground">
              Your approval has been recorded on the blockchain.
            </p>
            <Button onClick={() => router.push('/app')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isNaN(approvalId)) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Invalid Approval ID</h2>
            <p className="text-muted-foreground">The approval ID provided is not valid.</p>
            <Button onClick={() => router.push('/app')} variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Approval Request</h1>
          <p className="text-muted-foreground">Review and approve this payment</p>
        </div>

        {isLoadingStatus ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-sm text-muted-foreground">Approval ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">{params.approvalId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress(params.approvalId)}
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
                    <Badge>{requiredApprovals} approvals</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current:</span>
                    <Badge variant="secondary">{approvalCount} approved</Badge>
                  </div>
                  {isApproved && (
                    <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Approval threshold met</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  {error.message || 'Failed to approve. Please try again.'}
                </p>
              </div>
            )}

            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to approve or reject
                </p>
              </div>
            ) : isApproved ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  This approval has already been completed
                </p>
                <Button onClick={() => router.push('/app')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleApprove}
                  disabled={isPendingApprove}
                >
                  {isPendingApprove ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Approve
                    </>
                  )}
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
          </>
        )}
      </Card>
    </div>
  )
}
