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

    if (depositAmount > 0n) {
      writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
        gas: 100000n,
      })
    }
    
    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createMilestoneFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
      gas: 3000000n,
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
      writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
        gas: 100000n,
      })
    }

    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createSplitFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
      gas: 3000000n,
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
      writeContract({
        address: CONTRACT_ADDRESSES.MNEE_TOKEN,
        abi: MNEE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FLOW_FACTORY, depositAmount],
        gas: 100000n,
      })
    }

    writeContract({
      address: CONTRACT_ADDRESSES.FLOW_FACTORY,
      abi: FLOW_FACTORY_ABI,
      functionName: 'createRecurringFlow',
      args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
      gas: 3000000n,
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
  const hasAddress = !!address && address !== '0x'
  const factoryAddress = CONTRACT_ADDRESSES.FLOW_FACTORY
  const hasFactory = !!factoryAddress && factoryAddress.length > 2 && factoryAddress.startsWith('0x')

  if (!hasFactory) {
    return {
      flows: [],
      isLoading: false,
      error: new Error('FlowFactory contract address not configured'),
      refetch: () => {},
    }
  }

  const { data: flows, isLoading, error, refetch } = useReadContract({
    address: factoryAddress,
    abi: FLOW_FACTORY_ABI,
    functionName: 'getFlowsByOwner',
    args: hasAddress ? [address] : undefined,
    query: {
      enabled: hasAddress && hasFactory,
      retry: false,
      gcTime: 0,
    },
  })

  const errorMessage = error?.message || ''
  const isEmptyDataError = 
    errorMessage.includes('returned no data') || 
    errorMessage.includes('returned ("0x")') ||
    (errorMessage.includes('The contract function') && errorMessage.includes('returned no data'))
  
  if (Array.isArray(flows)) {
    return {
      flows: flows as `0x${string}`[],
      isLoading: false,
      error: null,
      refetch,
    }
  }

  if (isEmptyDataError) {
    return {
      flows: [],
      isLoading: false,
      error: null,
      refetch,
    }
  }

  return {
    flows: [],
    isLoading: isLoading && hasAddress,
    error,
    refetch,
  }
}
