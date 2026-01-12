'use client'

import { useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { formatUnits } from 'viem'
import type { Address } from 'viem'

interface Milestone {
  id: number
  amount: bigint
  recipient: Address
  completed: boolean
  paid: boolean
}

interface FlowVisualizationProps {
  milestones: Milestone[]
  flowType: number
  splits?: Array<{
    recipient: Address
    percentage: number
  }>
}

const MilestoneNode = ({ data }: { data: any }) => {
  const { milestone, index } = data
  const amount = formatUnits(milestone.amount, 18)
  
  return (
    <Card className="p-4 min-w-[200px] border-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">Milestone {index + 1}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {milestone.recipient.slice(0, 6)}...{milestone.recipient.slice(-4)}
          </div>
        </div>
        <div className="ml-2">
          {milestone.paid ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Paid
            </Badge>
          ) : milestone.completed ? (
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
      </div>
      <div className="text-lg font-bold mt-2">
        {Number(amount).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}{' '}
        MNEE
      </div>
    </Card>
  )
}

const SplitNode = ({ data }: { data: any }) => {
  const { split, index } = data
  
  return (
    <Card className="p-4 min-w-[200px] border-2 border-purple-500/30">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">Recipient {index + 1}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {split.recipient.slice(0, 6)}...{split.recipient.slice(-4)}
          </div>
        </div>
        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          <DollarSign className="h-3 w-3 mr-1" />
          {split.percentage}%
        </Badge>
      </div>
    </Card>
  )
}

const StartNode = () => {
  return (
    <Card className="p-4 min-w-[150px] border-2 border-green-500/30 bg-green-500/5">
      <div className="font-semibold text-sm mb-1">Flow Start</div>
      <div className="text-xs text-muted-foreground">Deposit funds</div>
    </Card>
  )
}

const EndNode = () => {
  return (
    <Card className="p-4 min-w-[150px] border-2 border-gray-500/30 bg-gray-500/5">
      <div className="font-semibold text-sm mb-1">Flow End</div>
      <div className="text-xs text-muted-foreground">All payments complete</div>
    </Card>
  )
}

const nodeTypes: NodeTypes = {
  milestone: MilestoneNode,
  split: SplitNode,
  start: StartNode,
  end: EndNode,
}

export function FlowVisualization({ milestones, flowType, splits }: FlowVisualizationProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = []
    const flowEdges: Edge[] = []

    if (flowType === 0 && milestones.length > 0) {
      flowNodes.push({
        id: 'start',
        type: 'start',
        position: { x: 0, y: 100 },
        data: {},
      })

      milestones.forEach((milestone, index) => {
        const x = 250 + index * 300
        flowNodes.push({
          id: `milestone-${milestone.id}`,
          type: 'milestone',
          position: { x, y: 100 },
          data: { milestone, index },
        })

        if (index === 0) {
          flowEdges.push({
            id: `edge-start-${milestone.id}`,
            source: 'start',
            target: `milestone-${milestone.id}`,
            animated: !milestone.paid && milestone.completed,
            style: {
              stroke: milestone.paid ? '#22c55e' : milestone.completed ? '#3b82f6' : '#6b7280',
              strokeWidth: 2,
            },
          })
        } else {
          flowEdges.push({
            id: `edge-${milestones[index - 1].id}-${milestone.id}`,
            source: `milestone-${milestones[index - 1].id}`,
            target: `milestone-${milestone.id}`,
            animated: !milestone.paid && milestone.completed,
            style: {
              stroke: milestone.paid ? '#22c55e' : milestone.completed ? '#3b82f6' : '#6b7280',
              strokeWidth: 2,
            },
          })
        }
      })

      flowNodes.push({
        id: 'end',
        type: 'end',
        position: { x: 250 + milestones.length * 300, y: 100 },
        data: {},
      })

      if (milestones.length > 0) {
        flowEdges.push({
          id: `edge-${milestones[milestones.length - 1].id}-end`,
          source: `milestone-${milestones[milestones.length - 1].id}`,
          target: 'end',
          style: {
            stroke: milestones.every(m => m.paid) ? '#22c55e' : '#6b7280',
            strokeWidth: 2,
          },
        })
      }
    } else if (flowType === 1 && splits && splits.length > 0) {
      flowNodes.push({
        id: 'start',
        type: 'start',
        position: { x: 0, y: 150 },
        data: {},
      })

      const splitNodesPerRow = 3
      splits.forEach((split, index) => {
        const row = Math.floor(index / splitNodesPerRow)
        const col = index % splitNodesPerRow
        const x = 250 + col * 250
        const y = 50 + row * 200

        flowNodes.push({
          id: `split-${index}`,
          type: 'split',
          position: { x, y },
          data: { split, index },
        })

        flowEdges.push({
          id: `edge-start-split-${index}`,
          source: 'start',
          target: `split-${index}`,
          style: {
            stroke: '#8b5cf6',
            strokeWidth: 2,
          },
        })
      })

      flowNodes.push({
        id: 'end',
        type: 'end',
        position: { x: 250 + (Math.min(splitNodesPerRow - 1, splits.length - 1) % splitNodesPerRow) * 250, y: 50 + Math.floor((splits.length - 1) / splitNodesPerRow) * 200 + 150 },
        data: {},
      })
    }

    return { nodes: flowNodes, edges: flowEdges }
  }, [milestones, flowType, splits])

  if (nodes.length === 0) {
    return null
  }

  return (
    <div className="w-full h-[400px] border rounded-lg overflow-hidden bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'start') return '#22c55e'
            if (node.type === 'end') return '#6b7280'
            if (node.data?.milestone?.paid) return '#22c55e'
            if (node.data?.milestone?.completed) return '#3b82f6'
            return '#9ca3af'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}
