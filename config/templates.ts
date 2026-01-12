import { Target, DollarSign, Lock, RefreshCw } from 'lucide-react'

export const templates = [
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
