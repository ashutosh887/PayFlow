"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, CheckCircle2, Plus, Clock } from 'lucide-react'
import { mockActivities } from '@/config/mock'

export default function ActivityPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity</h1>
        <p className="text-muted-foreground">
          View all your payment flow activities and events
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {mockActivities.map((activity, idx) => {
            const Icon = activity.icon
            return (
              <div key={activity.id}>
                <div className="flex items-start gap-4">
                  <div className={`
                    p-2 rounded-full
                    ${activity.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10'}
                  `}>
                    <Icon className={`
                      h-4 w-4
                      ${activity.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}
                    `} />
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
                {idx < mockActivities.length - 1 && <Separator className="mt-4" />}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
  