'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, APPROVAL_MANAGER_ABI } from '@/lib/contracts'
import { Address } from 'viem'

export function useCreateApproval() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createApproval = async (approvers: Address[], requiredApprovals: number) => {
    if (!CONTRACT_ADDRESSES.APPROVAL_MANAGER) {
      throw new Error('ApprovalManager address not configured')
    }

    writeContract({
      address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
      abi: APPROVAL_MANAGER_ABI,
      functionName: 'createApproval',
      args: [approvers, BigInt(requiredApprovals)],
    })
  }

  return {
    createApproval,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  }
}

export function useApprove(approvalId: number | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async () => {
    if (approvalId === undefined) {
      throw new Error('Approval ID not provided')
    }

    if (!CONTRACT_ADDRESSES.APPROVAL_MANAGER) {
      throw new Error('ApprovalManager address not configured')
    }

    writeContract({
      address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
      abi: APPROVAL_MANAGER_ABI,
      functionName: 'approve',
      args: [BigInt(approvalId)],
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

export function useApprovalStatus(approvalId: number | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    abi: APPROVAL_MANAGER_ABI,
    functionName: 'getApprovalStatus',
    args: approvalId !== undefined ? [BigInt(approvalId)] : undefined,
    query: {
      enabled: approvalId !== undefined && !!CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    },
  })

  return {
    approvalCount: data?.[0] ? Number(data[0]) : 0,
    requiredApprovals: data?.[1] ? Number(data[1]) : 0,
    isApproved: data?.[2] ?? false,
    isLoading,
    error,
  }
}

export function useIsApproved(approvalId: number | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    abi: APPROVAL_MANAGER_ABI,
    functionName: 'isApproved',
    args: approvalId !== undefined ? [BigInt(approvalId)] : undefined,
    query: {
      enabled: approvalId !== undefined && !!CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    },
  })

  return {
    isApproved: data ?? false,
    isLoading,
    error,
  }
}
