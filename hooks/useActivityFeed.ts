'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWatchContractEvent, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI, APPROVAL_MANAGER_ABI, PAYMENT_FLOW_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { Plus, CheckCircle2, DollarSign, AlertCircle, Pause, Play, X } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'flow_created' | 'payment' | 'approval' | 'milestone' | 'deposit' | 'pause' | 'resume' | 'cancel'
  title: string
  description: string
  time: number
  icon: typeof Plus
  status: 'completed' | 'pending'
  txHash?: string
}

const STORAGE_KEY = 'payflow_activity_feed'

function saveActivity(address: string, activity: ActivityItem) {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`)
    const activities = stored ? JSON.parse(stored) : []
    activities.unshift(activity)
    localStorage.setItem(`${STORAGE_KEY}_${address}`, JSON.stringify(activities.slice(0, 100)))
  } catch {}
}

export function useActivityFeed() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!address) {
      setActivities([])
      return
    }
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${address}`)
      if (stored) {
        setActivities(JSON.parse(stored))
      }
    } catch {}
  }, [address])

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.FLOW_FACTORY,
    abi: FLOW_FACTORY_ABI,
    eventName: 'FlowCreated',
    onLogs(logs) {
      if (!address) return
      logs.forEach((log) => {
        if (log.args.owner?.toLowerCase() === address?.toLowerCase()) {
          const flowType = Number(log.args.flowType)
          const typeNames = ['Milestone', 'Split', 'Recurring', 'Escrow']
          const newActivity: ActivityItem = {
            id: `flow-${log.args.flowAddress}-${Date.now()}`,
            type: 'flow_created' as const,
            title: 'Flow Created',
            description: `Created ${typeNames[flowType] || 'Payment'} flow`,
            time: Date.now(),
            icon: Plus,
            status: 'completed' as const,
          }
          saveActivity(address, newActivity)
          setActivities(prev => [newActivity, ...prev].slice(0, 100))
        }
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.FLOW_FACTORY,
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.APPROVAL_MANAGER,
    abi: APPROVAL_MANAGER_ABI,
    eventName: 'ApprovalGiven',
    onLogs(logs) {
      if (!address) return
      logs.forEach((log) => {
        if (log.args.approver?.toLowerCase() === address?.toLowerCase()) {
          const newActivity: ActivityItem = {
            id: `approval-${log.args.approvalId}-${Date.now()}`,
            type: 'approval' as const,
            title: 'Approval Given',
            description: `Approved request #${log.args.approvalId}`,
            time: Date.now(),
            icon: CheckCircle2,
            status: 'completed' as const,
          }
          saveActivity(address, newActivity)
          setActivities(prev => [newActivity, ...prev].slice(0, 100))
        }
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.APPROVAL_MANAGER,
  })

  return { activities }
}
