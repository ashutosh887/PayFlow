"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface FlowCardProps {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  totalAmount: string
  remainingAmount: string
  nextMilestone?: string
  type: string
}

export function FlowCard({
  id,
  name,
  status,
  totalAmount,
  remainingAmount,
  nextMilestone,
  type,
}: FlowCardProps) {
  const statusColors = {
    active: 'bg-green-500/10 text-green-500',
    paused: 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-gray-500/10 text-gray-500',
  }

  const statusIcons = {
    active: <Clock className="h-3 w-3" />,
    paused: <Clock className="h-3 w-3" />,
    completed: <CheckCircle2 className="h-3 w-3" />,
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{name}</h3>
          <Badge variant="outline" className="text-xs">{type}</Badge>
        </div>
        <Badge className={statusColors[status]}>
          <span className="mr-1">{statusIcons[status]}</span>
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">
            {Number(totalAmount).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{' '}
            MNEE
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining:</span>
          <span className="font-medium">
            {Number(remainingAmount).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{' '}
            MNEE
          </span>
        </div>
        {nextMilestone && (
          <div className="text-sm text-muted-foreground">
            Next: {nextMilestone}
          </div>
        )}
      </div>

      <Link href={`/app/flows/${id}`}>
        <Button variant="outline" className="w-full">
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </Card>
  )
}
