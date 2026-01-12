'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWatchContractEvent } from 'wagmi'
import { CONTRACT_ADDRESSES, APPROVAL_MANAGER_ABI } from '@/lib/contracts'
import { Address } from 'viem'

interface PendingApproval {
  approvalId: number
  requiredApprovals: number
  createdAt: number
}

const STORAGE_KEY = 'payflow_pending_approvals'

function getStoredApprovals(address: string): Record<number, PendingApproval> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveApproval(address: string, approval: PendingApproval) {
  if (typeof window === 'undefined') return
  try {
    const stored = getStoredApprovals(address)
    stored[approval.approvalId] = approval
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(stored))
  } catch {}
}

function removeApproval(address: string, approvalId: number) {
  if (typeof window === 'undefined') return
  try {
    const stored = getStoredApprovals(address)
    delete stored[approvalId]
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(stored))
  } catch {}
}

export function usePendingApprovals() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    abi: APPROVAL_MANAGER_ABI,
    eventName: 'ApprovalCreated',
    onLogs(logs) {
      if (!address || !publicClient) return
      logs.forEach(async (log) => {
        const approvalId = Number(log.args.approvalId)
        const approvers = (log.args.approvers || []) as Address[]
        const requiredApprovals = Number(log.args.requiredApprovals)
        
        if (approvers.some(a => a.toLowerCase() === address.toLowerCase())) {
          saveApproval(address, {
            approvalId,
            requiredApprovals,
            createdAt: Date.now(),
          })
        }
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.APPROVAL_MANAGER && !!address,
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    abi: APPROVAL_MANAGER_ABI,
    eventName: 'ApprovalThresholdMet',
    onLogs(logs) {
      if (!address) return
      logs.forEach((log) => {
        const approvalId = Number(log.args.approvalId)
        removeApproval(address, approvalId)
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.APPROVAL_MANAGER,
  })

  useEffect(() => {
    if (!isConnected || !address || !publicClient || !CONTRACT_ADDRESSES.APPROVAL_MANAGER) {
      setPendingApprovals([])
      return
    }

    const checkApprovals = async () => {
      const stored = getStoredApprovals(address)
      const approvals: PendingApproval[] = []

      for (const approval of Object.values(stored)) {
        try {
          const status = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
            abi: APPROVAL_MANAGER_ABI,
            functionName: 'getApprovalStatus',
            args: [BigInt(approval.approvalId)],
          })
          
          const isApproved = status[2] as boolean
          if (!isApproved) {
            approvals.push(approval)
          } else {
            removeApproval(address, approval.approvalId)
          }
        } catch {
          approvals.push(approval)
        }
      }

      setPendingApprovals(approvals)
    }

    checkApprovals()
    const interval = setInterval(checkApprovals, 10000)
    return () => clearInterval(interval)
  }, [isConnected, address, publicClient])

  return { pendingApprovals, isLoading: false }
}
