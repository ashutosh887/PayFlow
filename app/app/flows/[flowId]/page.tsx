"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useFlowData, usePauseFlow, useResumeFlow, useCancelFlow, useAddMilestone, useAddSplit, useExecuteSplitPayment, useFlowSplits, useDepositToFlow, useMarkMilestoneComplete, useExecuteMilestonePayment } from '@/hooks/usePaymentFlow'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useState, useEffect, useMemo } from 'react'
import { FlowVisualization } from '@/components/dashboard/FlowVisualization'
import { useFlowMilestone, useFlowSplit } from '@/hooks/useFlowMilestones'

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
  const [splits, setSplits] = useState<any[]>([])
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('')
  const [newMilestoneRecipient, setNewMilestoneRecipient] = useState('')
  
  const [showAddSplit, setShowAddSplit] = useState(false)
  const [newSplitRecipient, setNewSplitRecipient] = useState('')
  const [newSplitPercentage, setNewSplitPercentage] = useState('')

  const { pause, isPending: isPendingPause, isSuccess: isPauseSuccess } = usePauseFlow(flowAddress)
  const { resume, isPending: isPendingResume, isSuccess: isResumeSuccess } = useResumeFlow(flowAddress)
  const { cancel, isPending: isPendingCancel, isSuccess: isCancelSuccess } = useCancelFlow(flowAddress)
  const { addMilestone, isPending: isPendingAdd, isSuccess: isAddSuccess } = useAddMilestone(flowAddress)
  const { addSplit, isPending: isPendingAddSplit, isSuccess: isAddSplitSuccess } = useAddSplit(flowAddress)
  const { executeSplit, isPending: isPendingExecuteSplit, isSuccess: isExecuteSplitSuccess } = useExecuteSplitPayment(flowAddress)
  const { deposit, isPending: isPendingDeposit, isSuccess: isDepositSuccess } = useDepositToFlow(flowAddress)
  const { markComplete, isPending: isPendingMark, isSuccess: isMarkSuccess } = useMarkMilestoneComplete(flowAddress)
  const { executePayment, isPending: isPendingExecute, isSuccess: isExecuteSuccess } = useExecuteMilestonePayment(flowAddress)
  const { splitCount } = useFlowSplits(flowAddress)
  
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')

  useEffect(() => {
    if (isAddSuccess) {
      window.location.reload()
    }
  }, [isAddSuccess])

  useEffect(() => {
    if (isAddSplitSuccess) {
      window.location.reload()
    }
  }, [isAddSplitSuccess])

  useEffect(() => {
    if (isMarkSuccess || isExecuteSuccess || isDepositSuccess) {
      setTimeout(() => window.location.reload(), 2000)
    }
  }, [isMarkSuccess, isExecuteSuccess, isDepositSuccess])

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
    }
  }

  const handleAddSplit = async () => {
    if (!newSplitRecipient || !newSplitPercentage) {
      return
    }

    const percentage = parseFloat(newSplitPercentage)
    if (percentage <= 0 || percentage > 100) {
      return
    }

    try {
      await addSplit(newSplitRecipient as `0x${string}`, percentage)
      setNewSplitRecipient('')
      setNewSplitPercentage('')
      setShowAddSplit(false)
    } catch (err) {
    }
  }

  const handleMarkComplete = async (milestoneId: number) => {
    try {
      await markComplete(milestoneId)
    } catch (err) {
      console.error('Failed to mark milestone complete:', err)
    }
  }

  const handleExecutePayment = async (milestoneId: number) => {
    try {
      await executePayment(milestoneId)
    } catch (err) {
      console.error('Failed to execute payment:', err)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount) return
    try {
      await deposit(depositAmount)
      setDepositAmount('')
      setShowDeposit(false)
    } catch (err) {
      console.error('Failed to deposit:', err)
    }
  }

  const handleExecuteSplit = async () => {
    try {
      await executeSplit()
    } catch (err) {
    }
  }

  const MilestoneItem = ({ index }: { index: number }) => {
    const milestone = useFlowMilestone(flowAddress, index)
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="font-medium mb-1">Milestone {index + 1}</div>
            <div className="text-sm text-muted-foreground font-mono mb-1">
              {milestone.recipient && milestone.recipient !== '0x' 
                ? `${milestone.recipient.slice(0, 6)}...${milestone.recipient.slice(-4)}`
                : 'Loading...'}
            </div>
            <div className="text-sm font-medium">
              {milestone.amount > 0n
                ? `${Number(formatUnits(milestone.amount, 18)).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })} MNEE`
                : 'Loading...'}
            </div>
          </div>
          <Badge
            className={
              milestone.paid
                ? 'bg-green-500/10 text-green-500'
                : milestone.completed
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-gray-500/10 text-gray-500'
            }
          >
            {milestone.paid ? 'Paid' : milestone.completed ? 'Ready' : 'Pending'}
          </Badge>
        </div>
        {isOwner && status === 0 && (
          <div className="flex gap-2 mt-3">
            {!milestone.completed && !milestone.paid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkComplete(index)}
                disabled={isPendingMark}
              >
                {isPendingMark ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking...
                  </>
                ) : (
                  'Mark Complete'
                )}
              </Button>
            )}
            {milestone.completed && !milestone.paid && (
              <Button
                size="sm"
                onClick={() => handleExecutePayment(index)}
                disabled={isPendingExecute}
              >
                {isPendingExecute ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  'Execute Payment'
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  }

  const SplitItem = ({ index }: { index: number }) => {
    const split = useFlowSplit(flowAddress, index)
    return (
      <div className="p-3 rounded bg-muted">
        <div className="text-sm font-mono mb-1">
          {split.recipient && split.recipient !== '0x'
            ? `${split.recipient.slice(0, 6)}...${split.recipient.slice(-4)}`
            : 'Loading...'}
        </div>
        <div className="text-sm font-medium">
          {split.percentage > 0 ? `${split.percentage}%` : 'Loading...'}
        </div>
      </div>
    )
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
          <p className="text-sm text-muted-foreground">View and manage your payment flow</p>
        </div>
        <div className="pt-6 space-y-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          </div>
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
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
        <p className="text-sm text-muted-foreground">View and manage your payment flow</p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Flow Information</h2>
            {isOwner && status === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeposit(!showDeposit)}
              >
                Deposit Funds
              </Button>
            )}
          </div>
          
          {showDeposit && (
            <Card className="p-4 mb-4 bg-muted/50">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="deposit-amount">Amount (MNEE)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeposit}
                    disabled={isPendingDeposit || !depositAmount}
                    size="sm"
                  >
                    {isPendingDeposit ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      'Deposit'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeposit(false)
                      setDepositAmount('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
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
          <>
            {milestones.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Flow Visualization</h2>
                <FlowVisualization milestones={milestones} flowType={flowType} />
              </Card>
            )}
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
                  {Array.from({ length: milestoneCount }, (_, i) => (
                    <MilestoneItem key={i} index={i} />
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {flowType === 1 && (
          <>
            {splits.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Flow Visualization</h2>
                <FlowVisualization milestones={[]} flowType={flowType} splits={splits} />
              </Card>
            )}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Revenue Splits</h2>
                {isOwner && status === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSplit(!showAddSplit)}
                  >
                    Add Split
                  </Button>
                )}
              </div>

            {showAddSplit && (
              <Card className="p-4 mb-4 bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="split-recipient">Recipient Address</Label>
                    <Input
                      id="split-recipient"
                      type="text"
                      placeholder="0x..."
                      value={newSplitRecipient}
                      onChange={(e) => setNewSplitRecipient(e.target.value)}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="split-percentage">Percentage (1-100)</Label>
                    <Input
                      id="split-percentage"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      placeholder="50"
                      value={newSplitPercentage}
                      onChange={(e) => setNewSplitPercentage(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddSplit}
                      disabled={isPendingAddSplit || !newSplitRecipient || !newSplitPercentage}
                      size="sm"
                    >
                      {isPendingAddSplit ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Split'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddSplit(false)
                        setNewSplitRecipient('')
                        setNewSplitPercentage('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {splitCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No splits configured yet. Add recipients to split payments.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {splitCount} split recipient(s) configured
                </div>
                <div className="space-y-2">
                  {Array.from({ length: splitCount }, (_, i) => (
                    <SplitItem key={i} index={i} />
                  ))}
                </div>
                {isOwner && status === 0 && remainingAmount > 0n && (
                  <Button
                    onClick={handleExecuteSplit}
                    disabled={isPendingExecuteSplit}
                    className="w-full"
                  >
                    {isPendingExecuteSplit ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        Execute Split Payment
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </Card>
          </>
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
