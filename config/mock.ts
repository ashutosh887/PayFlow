import { Send, CheckCircle2, Plus, Clock, Target, DollarSign, Lock, RefreshCw } from 'lucide-react'

export const mockFlows = [
  {
    id: '1',
    name: 'Website Redesign',
    status: 'active' as const,
    totalAmount: '5,000',
    remainingAmount: '1,500',
    nextMilestone: 'Development milestone pending approval',
    type: 'Milestone Payment',
  },
  {
    id: '2',
    name: 'Band Revenue Split',
    status: 'active' as const,
    totalAmount: '2,340',
    remainingAmount: '0',
    type: 'Revenue Split',
  },
]

export const mockApprovals = [
  {
    id: '1',
    flowName: 'Marketing Invoice',
    amount: '800',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    required: 2,
    current: 1,
  },
  {
    id: '2',
    flowName: 'Contractor Milestone',
    amount: '1,500',
    recipient: '0x891f3f5e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e',
    required: 1,
    current: 0,
  },
]

export const mockActivity = [
  {
    type: 'payment',
    description: 'Payment sent',
    details: '500 MNEE to 0x742d...',
    time: '2h ago',
  },
  {
    type: 'approval',
    description: 'Approval received',
    details: 'From 0x891f...',
    time: '5h ago',
  },
  {
    type: 'flow',
    description: 'Flow created',
    details: 'Q1 Budget',
    time: '1d ago',
  },
]

export const mockTemplates = [
  {
    id: 'milestone',
    name: 'Milestone Payment',
    description: 'Pay contractors when milestones are completed and approved',
    icon: Target,
    features: ['Multi-milestone support', 'Approval gates', 'Automatic release'],
  },
  {
    id: 'split',
    name: 'Revenue Split',
    description: 'Automatically split incoming payments among multiple recipients',
    icon: DollarSign,
    features: ['Percentage-based splits', 'Multiple recipients', 'Real-time distribution'],
  },
  {
    id: 'escrow',
    name: 'Escrow Release',
    description: 'Hold funds until both parties agree to release',
    icon: Lock,
    features: ['Two-party approval', 'Secure holding', 'Automatic release'],
  },
  {
    id: 'recurring',
    name: 'Recurring Payment',
    description: 'Set up automatic recurring payments on a schedule',
    icon: RefreshCw,
    features: ['Time-based triggers', 'Recurring schedule', 'Auto-execution'],
  },
]

export const mockActivities = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment sent',
    description: '500 MNEE to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    time: '2 hours ago',
    icon: Send,
    status: 'completed' as const,
  },
  {
    id: '2',
    type: 'approval',
    title: 'Approval received',
    description: 'From 0x891f3f5e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e',
    time: '5 hours ago',
    icon: CheckCircle2,
    status: 'completed' as const,
  },
  {
    id: '3',
    type: 'flow',
    title: 'Flow created',
    description: 'Q1 Budget - Milestone Payment',
    time: '1 day ago',
    icon: Plus,
    status: 'completed' as const,
  },
  {
    id: '4',
    type: 'approval',
    title: 'Approval pending',
    description: 'Development milestone requires your approval',
    time: '3 hours ago',
    icon: Clock,
    status: 'pending' as const,
  },
]
