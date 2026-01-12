'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI, MNEE_TOKEN_ABI } from '@/lib/contracts'
import { parseUnits, maxUint256 } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'

type FlowFunctionName = 'createMilestoneFlow' | 'createSplitFlow' | 'createRecurringFlow'

async function ensureTokenApproval(
  depositAmount: bigint,
  address: Address,
  walletClient: any,
  publicClient: any,
  refetchAllowance: () => Promise<any>
) {
  if (depositAmount === 0n) return

  const { data: currentAllowance } = await refetchAllowance()
  const allowanceAmount = (currentAllowance as bigint) || 0n

  if (allowanceAmount < depositAmount) {
    const approvalHash = await walletClient.writeContract({
      account: address,
      address: CONTRACT_ADDRESSES.MNEE_TOKEN,
      abi: MNEE_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.FLOW_FACTORY, maxUint256],
    })
    
    await publicClient.waitForTransactionReceipt({ hash: approvalHash })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: updatedAllowance } = await refetchAllowance()
    const updatedAmount = (updatedAllowance as bigint) || 0n
    
    if (updatedAmount < depositAmount) {
      throw new Error('Token approval failed. Please try again.')
    }
  }
}

function useCreateFlowBase(functionName: FlowFunctionName) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash || hash,
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.MNEE_TOKEN,
    abi: MNEE_TOKEN_ABI,
    functionName: 'allowance',
    args: address && CONTRACT_ADDRESSES.FLOW_FACTORY ? [address, CONTRACT_ADDRESSES.FLOW_FACTORY] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.FLOW_FACTORY,
    },
  })

  const createFlow = async (initialDeposit: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!walletClient) {
      throw new Error('Wallet client not available')
    }

    if (!publicClient) {
      throw new Error('Public client not available')
    }

    const trimmedDeposit = (initialDeposit || '').trim()
    let depositAmount = 0n
    
    if (trimmedDeposit && trimmedDeposit !== '0' && trimmedDeposit !== '0.0' && trimmedDeposit !== '0.00') {
      try {
        depositAmount = parseUnits(trimmedDeposit, 18)
      } catch (error) {
        throw new Error(`Invalid deposit amount: ${trimmedDeposit}. Please enter a valid number.`)
      }
    }
    
    if (depositAmount > 0n) {
      await ensureTokenApproval(depositAmount, address, walletClient, publicClient, refetchAllowance)
    }
    
    let txHash: `0x${string}` | null = null
    try {
      txHash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_ADDRESSES.FLOW_FACTORY,
        abi: FLOW_FACTORY_ABI,
        functionName,
        args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
        gas: 3000000n,
      })
      
      setTxHash(txHash)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('payflow:transaction', {
          detail: {
            hash: txHash,
            type: 'flow_creation',
            functionName,
            to: CONTRACT_ADDRESSES.FLOW_FACTORY,
            amount: depositAmount > 0n ? (Number(depositAmount) / 1e18).toString() : undefined,
            status: 'pending'
          }
        }))
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      if (receipt.status === 'reverted') {
        throw new Error('Transaction was reverted by the contract. This usually happens when creating flows with initial deposits. Try creating with 0 deposit first.')
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.shortMessage || err?.cause?.message || 'Transaction failed. Please try again.'
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('payflow:transaction', {
          detail: {
            hash: txHash || '',
            type: 'flow_creation',
            functionName,
            to: CONTRACT_ADDRESSES.FLOW_FACTORY,
            status: 'failed',
            error: errorMessage
          }
        }))
      }
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    const currentHash = txHash || hash
    if (currentHash && isSuccess && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('payflow:transaction', {
        detail: {
          hash: currentHash,
          type: 'flow_creation',
          functionName,
          to: CONTRACT_ADDRESSES.FLOW_FACTORY,
          status: 'success'
        }
      }))
    }
  }, [txHash, hash, isSuccess, functionName])

  useEffect(() => {
    const currentHash = txHash || hash
    if (currentHash && error && typeof window !== 'undefined') {
      let errorMessage = 'Transaction failed'
      if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).shortMessage || String(error)
      } else if (error) {
        errorMessage = String(error)
      }
      window.dispatchEvent(new CustomEvent('payflow:transaction', {
        detail: {
          hash: currentHash,
          type: 'flow_creation',
          functionName,
          to: CONTRACT_ADDRESSES.FLOW_FACTORY,
          status: 'failed',
          error: errorMessage
        }
      }))
    }
  }, [txHash, hash, error, functionName])

  return {
    createFlow,
    hash: txHash || hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useCreateMilestoneFlow() {
  return useCreateFlowBase('createMilestoneFlow')
}

export function useCreateSplitFlow() {
  return useCreateFlowBase('createSplitFlow')
}

export function useCreateRecurringFlow() {
  return useCreateFlowBase('createRecurringFlow')
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
