"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, CheckCircle2, Plus, Clock, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { CONTRACT_ADDRESSES, FLOW_FACTORY_ABI, PAYMENT_FLOW_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'

interface ActivityItem {
  id: string
  type: 'payment' | 'approval' | 'flow'
  title: string
  description: string
  time: string
  icon: typeof Send
  status: 'completed' | 'pending'
}

export default function ActivityPage() {
  const { address, isConnected } = useAccount()
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.FLOW_FACTORY,
    abi: FLOW_FACTORY_ABI,
    eventName: 'FlowCreated',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.owner?.toLowerCase() === address?.toLowerCase()) {
          const newActivity: ActivityItem = {
            id: `flow-${log.args.flowAddress}-${Date.now()}`,
            type: 'flow',
            title: 'Flow created',
            description: `New ${Number(log.args.flowType) === 0 ? 'Milestone' : Number(log.args.flowType) === 1 ? 'Split' : 'Recurring'} flow created`,
            time: 'Just now',
            icon: Plus,
            status: 'completed',
          }
          setActivities((prev) => [newActivity, ...prev].slice(0, 50))
        }
      })
    },
    enabled: isConnected && !!CONTRACT_ADDRESSES.FLOW_FACTORY,
  })

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">Activity</h1>
            <p className="text-sm text-muted-foreground">
              View all your payment flow activities and events
            </p>
          </div>
        </div>

        <div className="pt-6 px-4">
          <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to view activity</p>
          </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center">
        <div>
          <h1 className="text-xl font-bold mb-1">Activity</h1>
          <p className="text-sm text-muted-foreground">
            View all your payment flow activities and events
          </p>
        </div>
      </div>

      <div className="pt-6 px-4">
        <Card className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium mb-1">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Your payment flow activities will appear here as you create flows and execute payments.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => {
              const Icon = activity.icon
              return (
                <div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                      p-2 rounded-full
                      ${activity.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10'}
                    `}
                    >
                      <Icon
                        className={`
                        h-4 w-4
                        ${activity.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}
                      `}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{activity.title}</div>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {idx < activities.length - 1 && <Separator className="mt-4" />}
                </div>
              )
            })}
          </div>
        )}
        </Card>
      </div>
    </div>
  )
}
