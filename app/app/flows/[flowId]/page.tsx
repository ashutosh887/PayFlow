"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Pause,
  Play,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useFlowData, usePauseFlow, useResumeFlow, useCancelFlow, useAddMilestone } from '@/hooks/usePaymentFlow'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { PAYMENT_FLOW_ABI } from '@/lib/contracts'

export default function FlowDetailsPage({
  params,
}: {
  params: { flowId: string }
}) {
  const { address } = useAccount()
  const flowAddress = params.flowId as `0x${string}`
  const { status, totalAmount, remainingAmount, flowType, owner, milestoneCount, isLoading } =
    useFlowData(flowAddress)

  const [milestones, setMilestones] = useState<any[]>([])
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('')
  const [newMilestoneRecipient, setNewMilestoneRecipient] = useState('')

  const { pause, isPending: isPendingPause, isSuccess: isPauseSuccess } = usePauseFlow(flowAddress)
  const { resume, isPending: isPendingResume, isSuccess: isResumeSuccess } = useResumeFlow(flowAddress)
  const { cancel, isPending: isPendingCancel, isSuccess: isCancelSuccess } = useCancelFlow(flowAddress)
  const { addMilestone, isPending: isPendingAdd, isSuccess: isAddSuccess } = useAddMilestone(flowAddress)

  useEffect(() => {
    if (milestoneCount > 0) {
      const fetchMilestones = async () => {
        const milestoneData = []
        for (let i = 0; i < milestoneCount; i++) {
          milestoneData.push({
            id: i,
            amount: 0n,
            recipient: '0x',
            completed: false,
            paid: false,
          })
        }
        setMilestones(milestoneData)
      }
      fetchMilestones()
    }
  }, [milestoneCount])

  const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Active', color: 'bg-green-500/10 text-green-500' },
    1: { label: 'Paused', color: 'bg-yellow-500/10 text-yellow-500' },
    2: { label: 'Completed', color: 'bg-gray-500/10 text-gray-500' },
    3: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500' },
  }

  const flowTypeMap: Record<number, string> = {
    0: 'Milestone Payment',
    1: 'Revenue Split',
    2: 'Recurring Payment',
    3: 'Escrow',
  }

  const isOwner = address?.toLowerCase() === owner?.toLowerCase()

  const handleAddMilestone = async () => {
    if (!newMilestoneAmount || !newMilestoneRecipient) {
      return
    }

    try {
      await addMilestone(newMilestoneAmount, newMilestoneRecipient as `0x${string}`)
      setNewMilestoneAmount('')
      setNewMilestoneRecipient('')
      setShowAddMilestone(false)
    } catch (err) {
      console.error('Error adding milestone:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center gap-4">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Flow Details</h1>
        </div>
        <div className="pt-6 px-4">
          <Card className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center gap-4">
        <Link href="/app">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Flow Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage your payment flow</p>
        </div>
      </div>

      <div className="pt-6 space-y-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Status</div>
            <Badge className={statusMap[status]?.color || 'bg-gray-500/10 text-gray-500'}>
              {statusMap[status]?.label || 'Unknown'}
            </Badge>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
            <div className="text-2xl font-bold">
              {Number(formatUnits(totalAmount, 18)).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              MNEE
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Remaining</div>
            <div className="text-2xl font-bold">
              {Number(formatUnits(remainingAmount, 18)).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              MNEE
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Flow Information</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Flow Address</div>
              <div className="font-mono text-sm break-all">{params.flowId}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div>{flowTypeMap[flowType] || 'Unknown'}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground">Owner</div>
              <div className="font-mono text-sm">{owner}</div>
            </div>
          </div>
        </Card>

        {flowType === 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Milestones</h2>
              {isOwner && status === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                >
                  Add Milestone
                </Button>
              )}
            </div>

            {showAddMilestone && (
              <Card className="p-4 mb-4 bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amount">Amount (MNEE)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      type="text"
                      placeholder="0x..."
                      value={newMilestoneRecipient}
                      onChange={(e) => setNewMilestoneRecipient(e.target.value)}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddMilestone}
                      disabled={isPendingAdd || !newMilestoneAmount || !newMilestoneRecipient}
                      size="sm"
                    >
                      {isPendingAdd ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Milestone'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddMilestone(false)
                        setNewMilestoneAmount('')
                        setNewMilestoneRecipient('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {milestoneCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No milestones yet. Add your first milestone to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: milestoneCount }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-muted">
                    <div>
                      <div className="font-medium">Milestone {i + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Details will be loaded from contract
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {isOwner && (
          <div className="flex gap-3">
            {status === 0 && (
              <Button variant="outline" onClick={() => pause()} disabled={isPendingPause}>
                {isPendingPause ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Pausing...
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Flow
                  </>
                )}
              </Button>
            )}
            {status === 1 && (
              <Button variant="outline" onClick={() => resume()} disabled={isPendingResume}>
                {isPendingResume ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Flow
                  </>
                )}
              </Button>
            )}
            {(status === 0 || status === 1) && (
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => cancel()}
                disabled={isPendingCancel}
              >
                {isPendingCancel ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Flow
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {!isOwner && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">You are not the owner of this flow</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
