'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI, MNEE_TOKEN_ABI } from '@/lib/contracts'
import { parseUnits, maxUint256 } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

type FlowFunctionName = 'createMilestoneFlow' | 'createSplitFlow' | 'createRecurringFlow'

function useCreateFlowBase(functionName: FlowFunctionName) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const { data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirmingFromHash, isSuccess: isSuccessFromHash } = useWaitForTransactionReceipt({
    hash: hash,
  })

  const { writeContract: writeApproval, data: approvalHash, isPending: isApprovalPending, error: approvalError } = useWriteContract()
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
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

  const [needsApproval, setNeedsApproval] = useState(false)
  const [pendingDeposit, setPendingDeposit] = useState<bigint | null>(null)

  useEffect(() => {
    const createFlowAfterApproval = async () => {
      if (!isApprovalSuccess || !approvalHash || !pendingDeposit || !walletClient || !address || !publicClient) return
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: updatedAllowance } = await refetchAllowance()
        const updatedAmount = (updatedAllowance as bigint) || 0n
        
        if (updatedAmount >= pendingDeposit) {
          const flowHash = await walletClient.writeContract({
            account: address,
            address: CONTRACT_ADDRESSES.FLOW_FACTORY,
            abi: FLOW_FACTORY_ABI,
            functionName,
            args: [CONTRACT_ADDRESSES.MNEE_TOKEN, pendingDeposit],
            gas: 3000000n,
          })
          setTxHash(flowHash)
          setIsConfirming(true)
          
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash: flowHash })
            setIsConfirming(false)
            if (receipt.status === 'success') {
              setIsSuccess(true)
            }
          } catch {
            setIsConfirming(false)
          }
          
          setPendingDeposit(null)
          setNeedsApproval(false)
        }
      } catch (err: unknown) {
        console.error('Failed to create flow after approval:', err)
        setIsConfirming(false)
        setIsSuccess(false)
        setPendingDeposit(null)
        setNeedsApproval(false)
      }
    }
    
    createFlowAfterApproval()
  }, [isApprovalSuccess, approvalHash, pendingDeposit, walletClient, address, publicClient, functionName, refetchAllowance])

  const createFlow = async (initialDeposit: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!publicClient) {
      throw new Error('Public client not available')
    }

    setIsSuccess(false)
    setTxHash(null)

    const trimmedDeposit = (initialDeposit || '').trim()
    let depositAmount = 0n
    
    if (trimmedDeposit && trimmedDeposit !== '0' && trimmedDeposit !== '0.0' && trimmedDeposit !== '0.00') {
      try {
        depositAmount = parseUnits(trimmedDeposit, 18)
      } catch (error) {
        throw new Error(`Invalid deposit amount: ${trimmedDeposit}. Please enter a valid number.`)
      }
    }
    
    // Check if token approval is needed
    if (depositAmount > 0n) {
      const currentAllowance = (allowance as bigint) || 0n
      if (currentAllowance < depositAmount) {
        setPendingDeposit(depositAmount)
        setNeedsApproval(true)
        writeApproval({
          address: CONTRACT_ADDRESSES.MNEE_TOKEN,
          abi: MNEE_TOKEN_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.FLOW_FACTORY, maxUint256],
        })
        return
      }
    }
    
    if (!walletClient) {
      throw new Error('Wallet client not available')
    }
    
    let txHash: `0x${string}` | null = null
    try {
      if (!CONTRACT_ADDRESSES.FLOW_FACTORY || !CONTRACT_ADDRESSES.MNEE_TOKEN) {
        throw new Error('Contract addresses not configured. Please check your .env file.')
      }

      if (!CONTRACT_ADDRESSES.FLOW_FACTORY.startsWith('0x') || CONTRACT_ADDRESSES.FLOW_FACTORY.length !== 42) {
        throw new Error(`Invalid FlowFactory address: ${CONTRACT_ADDRESSES.FLOW_FACTORY}. Expected 42 character hex address.`)
      }

      if (!CONTRACT_ADDRESSES.MNEE_TOKEN.startsWith('0x') || CONTRACT_ADDRESSES.MNEE_TOKEN.length !== 42) {
        throw new Error(`Invalid MNEE Token address: ${CONTRACT_ADDRESSES.MNEE_TOKEN}. Expected 42 character hex address.`)
      }

      txHash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_ADDRESSES.FLOW_FACTORY,
        abi: FLOW_FACTORY_ABI,
        functionName,
        args: [CONTRACT_ADDRESSES.MNEE_TOKEN, depositAmount],
        gas: 3000000n,
      })
      
      if (!txHash) {
        throw new Error('Transaction hash not returned. Transaction may have failed.')
      }
      
      setTxHash(txHash)
      setIsConfirming(true)
      
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
      
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        timeout: 120000
      })
      setIsConfirming(false)
      
      if (receipt.status === 'reverted') {
        throw new Error('Transaction was reverted by the contract. This usually happens when creating flows with initial deposits. Try creating with 0 deposit first.')
      }
      
      if (receipt.status === 'success') {
        setIsSuccess(true)
      } else {
        throw new Error('Transaction failed on-chain')
      }
    } catch (err: unknown) {
      setIsConfirming(false)
      setIsSuccess(false)
      const errorMessage = (err as Error)?.message || (err as { shortMessage?: string })?.shortMessage || (err as { cause?: { message?: string } })?.cause?.message || 'Transaction failed. Please try again.'
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
    if (currentHash && (isSuccess || isSuccessFromHash) && typeof window !== 'undefined') {
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
  }, [txHash, hash, isSuccess, isSuccessFromHash, functionName])


  useEffect(() => {
    const currentHash = txHash || hash
    if (currentHash && error && typeof window !== 'undefined') {
      let errorMessage = 'Transaction failed'
      if (error && typeof error === 'object') {
        errorMessage = (error as { message?: string }).message || (error as { shortMessage?: string }).shortMessage || String(error)
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

  useEffect(() => {
    if (approvalError) {
      setNeedsApproval(false)
      setPendingDeposit(null)
    }
  }, [approvalError])

  return {
    createFlow,
    hash: txHash || hash,
    isPending: isPending || isConfirming || isConfirmingFromHash || isApprovalPending || isApprovalConfirming || needsApproval,
    isSuccess: isSuccess || isSuccessFromHash,
    error: error || approvalError,
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

  if (!hasFactory) {
    return {
      flows: [],
      isLoading: false,
      error: new Error('FlowFactory contract address not configured'),
      refetch: () => {},
    }
  }

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
