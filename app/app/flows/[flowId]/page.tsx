"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Pause, Play, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function FlowDetailsPage({
  params,
}: {
  params: { flowId: string }
}) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/app">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Flow Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Status</div>
          <Badge className="bg-green-500/10 text-green-500">Active</Badge>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
          <div className="text-2xl font-bold">5,000 MNEE</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Remaining</div>
          <div className="text-2xl font-bold">1,500 MNEE</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Flow Information</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Flow ID</div>
            <div className="font-mono">{params.flowId}</div>
          </div>
          <Separator />
          <div>
            <div className="text-sm text-muted-foreground">Type</div>
            <div>Milestone Payment</div>
          </div>
          <Separator />
          <div>
            <div className="text-sm text-muted-foreground">Created</div>
            <div>2 days ago</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Milestones</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-muted">
            <div>
              <div className="font-medium">Design Phase</div>
              <div className="text-sm text-muted-foreground">1,500 MNEE (30%)</div>
            </div>
            <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded bg-muted">
            <div>
              <div className="font-medium">Development Phase</div>
              <div className="text-sm text-muted-foreground">2,500 MNEE (50%)</div>
            </div>
            <Badge variant="outline">Pending Approval</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded bg-muted">
            <div>
              <div className="font-medium">Launch Phase</div>
              <div className="text-sm text-muted-foreground">1,000 MNEE (20%)</div>
            </div>
            <Badge variant="outline">Not Started</Badge>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline">
          <Pause className="h-4 w-4 mr-2" />
          Pause Flow
        </Button>
        <Button variant="outline" className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Cancel Flow
        </Button>
      </div>
    </div>
  )
}
  