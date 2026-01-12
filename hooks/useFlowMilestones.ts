'use client'

import { useReadContract } from 'wagmi'
import { PAYMENT_FLOW_ABI } from '@/lib/contracts'
import type { Address } from 'viem'

export function useFlowMilestone(flowAddress: Address | undefined, index: number) {
  const { data, isLoading, error } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'milestones',
    args: [BigInt(index)],
    query: { enabled: !!flowAddress },
  })

  if (!data) {
    return {
      id: index,
      amount: 0n,
      recipient: '0x' as Address,
      completed: false,
      paid: false,
      isLoading,
      error,
    }
  }

  return {
    id: index,
    amount: data[1] as bigint,
    recipient: data[2] as Address,
    completed: data[3] as boolean,
    paid: data[4] as boolean,
    isLoading,
    error,
  }
}

export function useFlowSplit(flowAddress: Address | undefined, index: number) {
  const { data, isLoading, error } = useReadContract({
    address: flowAddress,
    abi: PAYMENT_FLOW_ABI,
    functionName: 'splits',
    args: [BigInt(index)],
    query: { enabled: !!flowAddress },
  })

  if (!data) {
    return {
      recipient: '0x' as Address,
      percentage: 0,
      isLoading,
      error,
    }
  }

  return {
    recipient: data[0] as Address,
    percentage: Number(data[1] as bigint),
    isLoading,
    error,
  }
}
