"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Target,
  DollarSign,
  RefreshCw,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useCreateMilestoneFlow, useCreateSplitFlow, useCreateRecurringFlow } from '@/hooks/useFlowFactory'
import { useAccount, usePublicClient, useWatchContractEvent, useChainId } from 'wagmi'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/lib/toast'
import { setFlowMetadata } from '@/lib/flowMetadata'
import { Textarea } from '@/components/ui/textarea'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI } from '@/lib/contracts'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

const templates = [
  { id: 'milestone', name: 'Milestone Payment', icon: Target, description: 'Pay contractors when milestones are completed' },
  { id: 'split', name: 'Revenue Split', icon: DollarSign, description: 'Automatically split payments among recipients' },
  { id: 'recurring', name: 'Recurring Payment', icon: RefreshCw, description: 'Set up automatic recurring payments' },
]

export default function CreateFlowPage() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')
  const initialTemplate = templateParam && templates.some(t => t.id === templateParam) ? templateParam : null
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialTemplate)
  const [initialDeposit, setInitialDeposit] = useState('')
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [showForm, setShowForm] = useState(!!initialTemplate)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  const [createdFlowAddress, setCreatedFlowAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const chainId = useChainId()

  const {
    createFlow: createMilestoneFlow,
    isPending: isPendingMilestone,
    isSuccess: isSuccessMilestone,
    error: errorMilestone,
    hash: hashMilestone,
  } = useCreateMilestoneFlow()

  const {
    createFlow: createSplitFlow,
    isPending: isPendingSplit,
    isSuccess: isSuccessSplit,
    error: errorSplit,
    hash: hashSplit,
  } = useCreateSplitFlow()

  const {
    createFlow: createRecurringFlow,
    isPending: isPendingRecurring,
    isSuccess: isSuccessRecurring,
    error: errorRecurring,
    hash: hashRecurring,
  } = useCreateRecurringFlow()

  const isPending = isPendingMilestone || isPendingSplit || isPendingRecurring || isDeploying
  const isSuccess = isSuccessMilestone || isSuccessSplit || isSuccessRecurring
  const error = errorMilestone || errorSplit || errorRecurring
  const currentHash = hashMilestone || hashSplit || hashRecurring

  useEffect(() => {
    if (currentHash) {
      setTxHash(currentHash)
    }
  }, [currentHash])

  function getExplorerUrl(hash: string) {
    if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`
    return `https://etherscan.io/tx/${hash}`
  }

  // Watch for FlowCreated event to get the flow address and save metadata
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.FLOW_FACTORY,
    abi: FLOW_FACTORY_ABI,
    eventName: 'FlowCreated',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.owner?.toLowerCase() === address?.toLowerCase()) {
          const flowAddress = log.args.flowAddress as string
          setCreatedFlowAddress(flowAddress)
          if (flowName || flowDescription) {
            setFlowMetadata(flowAddress, {
              name: flowName || `Flow ${flowAddress.slice(0, 6)}...${flowAddress.slice(-4)}`,
              description: flowDescription,
            })
          }
        }
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.FLOW_FACTORY && isSuccess && !!address,
  })

  if (isSuccess && isDeploying) {
    setIsDeploying(false)
    setDeployError(null)
  }

  if (error && !deployError) {
    setDeployError(error.message || 'Failed to create flow')
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setShowForm(true)
  }

  const handleDeploy = async () => {
    if (!selectedTemplate || isPending) {
      return
    }

    setIsDeploying(true)
    setDeployError(null)
    
    try {
      const depositValue = (initialDeposit || '').trim()
      
      if (selectedTemplate === 'milestone') {
        await createMilestoneFlow(depositValue)
      } else if (selectedTemplate === 'split') {
        await createSplitFlow(depositValue)
      } else if (selectedTemplate === 'recurring') {
        await createRecurringFlow(depositValue)
      }
      
      showToast({
        type: 'success',
        title: 'Flow created successfully!',
        description: 'Your payment flow has been deployed to the blockchain.',
      })
    } catch (err: unknown) {
      setIsDeploying(false)
      const errorMessage = (err as Error)?.message || (err as { shortMessage?: string })?.shortMessage || 'Failed to create flow. Please try again.'
      setDeployError(errorMessage)
      showToast({
        type: 'error',
        title: 'Failed to create flow',
        description: errorMessage,
      })
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <p className="text-sm text-muted-foreground">Your payment flow has been deployed</p>
        </div>
        <div className="pt-6 px-4">
          <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Flow Created Successfully!</h2>
            <p className="text-muted-foreground">
              Your payment flow has been deployed to the blockchain.
            </p>
            {txHash && (
              <a
                href={getExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 justify-center mt-2"
              >
                View transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div className="pt-4">
              <Link href="/app">
                <Button>View Dashboard</Button>
              </Link>
            </div>
          </div>
        </Card>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <p className="text-sm text-muted-foreground">Connect your wallet to get started</p>
        </div>
        <div className="pt-6 px-4">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to create a payment flow.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center">
        <p className="text-sm text-muted-foreground">Choose a template to get started</p>
      </div>

      <div className="pt-6 px-4">
        {!showForm ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => {
              const IconComponent = template.icon
              return (
                <Card
                  key={template.id}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary h-full"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
            </div>
          </div>
        ) : (
          <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {templates.find((t) => t.id === selectedTemplate)?.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {templates.find((t) => t.id === selectedTemplate)?.description}
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Change Template
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="flow-name">Flow Name *</Label>
              <Input
                id="flow-name"
                type="text"
                placeholder="e.g., Q1 Project Payments"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
              {!flowName.trim() && flowName.length > 0 && (
                <p className="text-xs text-destructive mt-1">Flow name is required</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Give your flow a memorable name to easily identify it later
              </p>
            </div>

            <div>
              <Label htmlFor="flow-description">Description (Optional)</Label>
              <Textarea
                id="flow-description"
                placeholder="Describe the purpose of this payment flow..."
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                disabled={isPending}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="deposit">Initial Deposit (MNEE)</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialDeposit}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setInitialDeposit(val)
                  }
                }}
                disabled={isPending}
                className="mt-1"
              />
              {initialDeposit && (isNaN(Number(initialDeposit)) || Number(initialDeposit) < 0) && (
                <p className="text-xs text-destructive mt-1">Please enter a valid amount (0 or greater)</p>
              )}
              <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-600 font-medium mb-1">💡 Recommended Workflow</p>
                <p className="text-xs text-blue-600/80">
                  Create flow with <strong>0 deposit</strong> first, then deposit funds separately after creation. 
                  This avoids transaction timing issues and is more reliable.
                </p>
              </div>
            </div>

            {(error || deployError) && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  {error?.message || deployError || 'Failed to create flow. Please try again.'}
                </p>
                {((error?.message || deployError)?.includes('reverted') || 
                  (error?.message || deployError)?.includes('Token approval failed')) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-destructive/60">
                      💡 Tip: Try creating the flow with <strong>0 deposit</strong> first, then add funds after creation.
                    </p>
                    {(error?.message || deployError)?.includes('not configured') && (
                      <p className="text-xs text-destructive/60">
                        ⚠️ Make sure your .env file has all required contract addresses configured.
                      </p>
                    )}
                  </div>
                )}
                {(error?.message || deployError)?.includes('cancelled') && (
                  <p className="text-xs text-destructive/60 mt-2">
                    💡 Please approve the transaction in your wallet to continue.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeploy}
                disabled={isPending || !flowName.trim()}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Deploy Flow
                  </>
                )}
              </Button>
            </div>

            {selectedTemplate === 'milestone' && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Next steps:</strong> After deployment, you can add milestones, set recipients,
                  and configure payment amounts in the flow details page.
                </p>
              </div>
            )}
          </div>
        </Card>
        )}
      </div>
    </div>
  )
}
