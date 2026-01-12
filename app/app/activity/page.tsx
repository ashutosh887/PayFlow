"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useActivityFeed } from '@/hooks/useActivityFeed'

export default function ActivityPage() {
  const { isConnected } = useAccount()
  const { activities } = useActivityFeed()

  function formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <p className="text-sm text-muted-foreground">
            View all your payment flow activities and events
          </p>
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
        <p className="text-sm text-muted-foreground">
          View all your payment flow activities and events
        </p>
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
                        <p className="text-xs text-muted-foreground">{formatTime(activity.time)}</p>
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
