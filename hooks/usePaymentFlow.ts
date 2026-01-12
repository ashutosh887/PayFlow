'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, PAYMENT_FLOW_ABI } from '@/lib/contracts'
import { Address, formatUnits, parseUnits } from 'viem'

export interface FlowData {
  address: Address
  status: number
  totalAmount: bigint
  remainingAmount: bigint
  flowType: number
  owner: Address
  milestoneCount: number
  milestones: Array<{
    milestoneId: bigint
    amount: bigint
    recipient: Address
    completed: boolean
    paid: boolean
  }>
}

export function useFlowData(flowAddress: Address | undefined) {
  const { data: status, isLoading: isLoadingStatus } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'status',
    query: { enabled: !!flowAddress },
  })

  const { data: totalAmount, isLoading: isLoadingTotal } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'totalAmount',
    query: { enabled: !!flowAddress },
  })

  const { data: remainingAmount, isLoading: isLoadingRemaining } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'remainingAmount',
    query: { enabled: !!flowAddress },
  })

  const { data: flowType, isLoading: isLoadingType } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'flowType',
    query: { enabled: !!flowAddress },
  })

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'owner',
    query: { enabled: !!flowAddress },
  })

  const { data: milestoneCount, isLoading: isLoadingMilestoneCount } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'getMilestoneCount',
    query: { enabled: !!flowAddress },
  })

  const isLoading =
    isLoadingStatus ||
    isLoadingTotal ||
    isLoadingRemaining ||
    isLoadingType ||
    isLoadingOwner ||
    isLoadingMilestoneCount

  return {
    status: status ?? 0,
    totalAmount: totalAmount ?? BigInt(0),
    remainingAmount: remainingAmount ?? BigInt(0),
    flowType: flowType ?? 0,
    owner: owner ?? '0x',
    milestoneCount: milestoneCount ? Number(milestoneCount) : 0,
    isLoading,
  }
}

export function useFlowMilestones(flowAddress: Address | undefined, count: number) {
  const milestoneQueries = Array.from({ length: count }, (_, i) => ({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'milestones' as const,
    args: [BigInt(i)],
    query: { enabled: !!flowAddress && count > 0 },
  }))

  return {
    milestoneCount: count,
  }
}

export function useDepositToFlow(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async (amount: string) => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    const amountWei = parseUnits(amount, 18)

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'deposit',
      args: [amountWei],
    })
  }

  return {
    deposit,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useAddMilestone(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addMilestone = async (amount: string, recipient: Address) => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    const amountWei = parseUnits(amount, 18)

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'addMilestone',
      args: [amountWei, recipient],
    })
  }

  return {
    addMilestone,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useMarkMilestoneComplete(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const markComplete = async (milestoneId: number) => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'markMilestoneComplete',
      args: [BigInt(milestoneId)],
    })
  }

  return {
    markComplete,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useExecuteMilestonePayment(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const executePayment = async (milestoneId: number) => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'executeMilestonePayment',
      args: [BigInt(milestoneId)],
    })
  }

  return {
    executePayment,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function usePauseFlow(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const pause = async () => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'pause',
    })
  }

  return {
    pause,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useResumeFlow(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const resume = async () => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'resume',
    })
  }

  return {
    resume,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useCancelFlow(flowAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const cancel = async () => {
    if (!flowAddress) {
      throw new Error('Flow address not provided')
    }

    writeContract({
      address: flowAddress,
      abi: PAYMENT_FLOW_ABI,
      functionName: 'cancel',
    })
  }

  return {
    cancel,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}
