'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, MNEE_TOKEN_ABI } from '@/lib/contracts'
import { parseUnits } from 'viem'

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (amount: string) => {
    if (!CONTRACT_ADDRESSES.FLOW_FACTORY) {
      throw new Error('FlowFactory address not configured')
    }

    const amountWei = parseUnits(amount, 18)

    writeContract({
      address: CONTRACT_ADDRESSES.MNEE_TOKEN,
      abi: MNEE_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.FLOW_FACTORY, amountWei],
      gas: 100000n,
    })
  }

  return {
    approve,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}
