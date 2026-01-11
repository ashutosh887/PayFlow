"use client"

export const dynamic = 'force-dynamic'

import { FlowCard } from '@/components/dashboard/FlowCard'
import { PendingApprovalCard } from '@/components/dashboard/PendingApprovalCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { mockFlows, mockApprovals, mockActivity } from '@/config/mock'

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your payment flows</p>
        </div>
        <Link href="/app/flows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Flows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockFlows.map((flow) => (
            <FlowCard key={flow.id} {...flow} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Pending Approvals ({mockApprovals.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockApprovals.map((approval) => (
            <PendingApprovalCard key={approval.id} {...approval} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-6">
          <div className="space-y-4">
            {mockActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.details} ({activity.time})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
  