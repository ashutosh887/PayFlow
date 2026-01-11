"use client"

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Save, 
  Trash2, 
  Plus, 
  Target, 
  DollarSign, 
  Lock, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Send, 
  PieChart, 
  GitBranch, 
  Clock 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 0 },
  },
]

const initialEdges: Edge[] = []

const nodeTypes: NodeTypes = {}

export default function CreateFlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      data: { label },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const templates = [
    { id: 'milestone', name: 'Milestone Payment', icon: Target },
    { id: 'split', name: 'Revenue Split', icon: DollarSign },
    { id: 'escrow', name: 'Escrow Release', icon: Lock },
    { id: 'recurring', name: 'Recurring Payment', icon: RefreshCw },
  ]

  const components = [
    { type: 'trigger', label: 'Trigger', icon: Zap },
    { type: 'approval', label: 'Approval Gate', icon: CheckCircle2 },
    { type: 'payment', label: 'Payment', icon: Send },
    { type: 'split', label: 'Split', icon: PieChart },
    { type: 'condition', label: 'Condition', icon: GitBranch },
    { type: 'delay', label: 'Delay', icon: Clock },
  ]

  const loadTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId === 'milestone') {
      const templateNodes: Node[] = [
        { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 0 } },
        { id: '2', type: 'default', data: { label: 'Milestone Complete' }, position: { x: 250, y: 100 } },
        { id: '3', type: 'default', data: { label: 'Approval Required' }, position: { x: 250, y: 200 } },
        { id: '4', type: 'default', data: { label: 'Send Payment' }, position: { x: 250, y: 300 } },
      ]
      const templateEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ]
      setNodes(templateNodes)
      setEdges(templateEdges)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="w-64 border-r p-4 space-y-4 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold mb-3">Templates</h3>
          <div className="space-y-2">
            {templates.map((template) => {
              const IconComponent = template.icon
              return (
                <Card
                  key={template.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => loadTemplate(template.id)}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{template.name}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Components</h3>
          <div className="space-y-2">
            {components.map((comp) => {
              const IconComponent = comp.icon
              return (
                <Card
                  key={comp.type}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => addNode(comp.type, comp.label)}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{comp.label}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Flow Builder</h2>
            {selectedTemplate && (
              <Badge variant="secondary">{templates.find(t => t.id === selectedTemplate)?.name}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Deploy Flow
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
  