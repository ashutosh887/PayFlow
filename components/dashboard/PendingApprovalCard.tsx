"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface PendingApprovalCardProps {
  id: string
  flowName: string
  amount: string
  recipient: string
  required: number
  current: number
}

export function PendingApprovalCard({
  id,
  flowName,
  amount,
  recipient,
  required,
  current,
}: PendingApprovalCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-1">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{flowName}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {amount} MNEE to {recipient.slice(0, 6)}...{recipient.slice(-4)}
          </p>
        </div>
        <Badge variant="secondary">
          {current}/{required} approved
        </Badge>
      </div>

      <div className="flex gap-2">
        <Link href={`/approve/${id}`} className="flex-1">
          <Button className="w-full" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Review
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>
    </Card>
  )
}
