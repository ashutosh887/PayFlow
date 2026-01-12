'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI, MNEE_TOKEN_ABI } from '@/lib/contracts'
import { parseUnits, formatUnits } from 'viem'
import { useAccount } from 'wagmi'

export function useCreateMilestoneFlow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createFlow = async (initialDeposit: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    const depositAmount = initialDeposit ? parseUnits(initialDeposit, 18) : 0n

    // First approve the token transfer if deposit > 0
    if (depositAmount > 0n) {
      const approveHash = await writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
      })
      
      // Wait for approval to be confirmed before creating flow
      if (approveHash) {
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            // In a real app, you'd wait for the transaction receipt
            // For now, we'll just wait a bit
            clearInterval(checkInterval)
            resolve(undefined)
          }, 1000)
        })
      }
    }

    // Then create the flow
    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createMilestoneFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
    })
  }

  return {
    createFlow,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useCreateSplitFlow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createFlow = async (initialDeposit: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    const depositAmount = initialDeposit ? parseUnits(initialDeposit, 18) : 0n

    if (depositAmount > 0n) {
      const approveHash = await writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
      })
      
      if (approveHash) {
        await new Promise((resolve) => {
          setTimeout(resolve, 1000)
        })
      }
    }

    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createSplitFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
    })
  }

  return {
    createFlow,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useCreateRecurringFlow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createFlow = async (initialDeposit: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    const depositAmount = initialDeposit ? parseUnits(initialDeposit, 18) : 0n

    if (depositAmount > 0n) {
      const approveHash = await writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
      })
      
      if (approveHash) {
        await new Promise((resolve) => {
          setTimeout(resolve, 1000)
        })
      }
    }

    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createRecurringFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
    })
  }

  return {
    createFlow,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useFlowsByOwner() {
  const { address } = useAccount()

  const { data: flows, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FLOW_FACTORY,
    abi: FLOW_FACTORY_ABI,
    functionName: 'getFlowsByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.FLOW_FACTORY,
    },
  })

  return {
    flows: flows || [],
    isLoading,
    error,
    refetch,
  }
}
