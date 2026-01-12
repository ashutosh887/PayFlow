import { Address } from 'viem'

export const CONTRACT_ADDRESSES = {
  FLOW_FACTORY: (process.env.NEXT_PUBLIC_FLOW_FACTORY_ADDRESS || '') as Address,
  PAYMENT_FLOW: (process.env.NEXT_PUBLIC_PAYMENT_FLOW_ADDRESS || '') as Address,
  APPROVAL_MANAGER: (process.env.NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS || '') as Address,
  MNEE_TOKEN: (process.env.NEXT_PUBLIC_MNEE_TOKEN_ADDRESS || '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF') as Address,
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const missing = []
  if (!CONTRACT_ADDRESSES.FLOW_FACTORY) missing.push('NEXT_PUBLIC_FLOW_FACTORY_ADDRESS')
  if (!CONTRACT_ADDRESSES.APPROVAL_MANAGER) missing.push('NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS')
  if (!CONTRACT_ADDRESSES.MNEE_TOKEN) missing.push('NEXT_PUBLIC_MNEE_TOKEN_ADDRESS')
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing contract addresses in .env:', missing.join(', '))
    console.warn('Please check your .env file and ensure all NEXT_PUBLIC_* addresses are set.')
  }
}

export const areContractsDeployed = () => {
  return !!(
    CONTRACT_ADDRESSES.FLOW_FACTORY &&
    CONTRACT_ADDRESSES.APPROVAL_MANAGER &&
    CONTRACT_ADDRESSES.MNEE_TOKEN
  )
}

export const FLOW_FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_paymentFlowImplementation', type: 'address' },
      { internalType: 'address', name: '_approvalManager', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'flowAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'flowType', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'FlowCreated',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: '_mneeToken', type: 'address' },
      { internalType: 'uint256', name: '_initialDeposit', type: 'uint256' },
    ],
    name: 'createMilestoneFlow',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_mneeToken', type: 'address' },
      { internalType: 'uint256', name: '_initialDeposit', type: 'uint256' },
    ],
    name: 'createSplitFlow',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_mneeToken', type: 'address' },
      { internalType: 'uint256', name: '_initialDeposit', type: 'uint256' },
    ],
    name: 'createRecurringFlow',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    name: 'getFlowsByOwner',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllFlows',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFlowCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const PAYMENT_FLOW_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_mneeToken', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'depositor', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'flowId', type: 'uint256' }],
    name: 'FlowCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'flowId', type: 'uint256' }],
    name: 'FlowCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'flowId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'flowType', type: 'uint8' },
      { indexed: false, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'FlowCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'FlowPaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'FlowResumed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'milestoneId', type: 'uint256' }],
    name: 'MilestoneCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PaymentExecuted',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'address', name: '_recipient', type: 'address' },
    ],
    name: 'addMilestone',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_recipient', type: 'address' },
      { internalType: 'uint256', name: '_percentage', type: 'uint256' },
    ],
    name: 'addSplit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_milestoneId', type: 'uint256' }],
    name: 'executeMilestonePayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'executeSplitPayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'flowType',
    outputs: [{ internalType: 'enum PaymentFlow.FlowType', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMilestoneCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSplitCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'milestoneCompleted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'milestones',
    outputs: [
      { internalType: 'uint256', name: 'milestoneId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bool', name: 'completed', type: 'bool' },
      { internalType: 'bool', name: 'paid', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_milestoneId', type: 'uint256' }],
    name: 'markMilestoneComplete',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mneeToken',
    outputs: [{ internalType: 'contract IMNEE', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'recipientAmounts',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'remainingAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resume',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'splits',
    outputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'percentage', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'status',
    outputs: [{ internalType: 'enum PaymentFlow.FlowStatus', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const APPROVAL_MANAGER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'approvalId', type: 'uint256' },
      { indexed: false, internalType: 'address[]', name: 'approvers', type: 'address[]' },
      { indexed: false, internalType: 'uint256', name: 'requiredApprovals', type: 'uint256' },
    ],
    name: 'ApprovalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'approvalId', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'approver', type: 'address' },
    ],
    name: 'ApprovalGiven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'approvalId', type: 'uint256' }],
    name: 'ApprovalThresholdMet',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_approvers', type: 'address[]' },
      { internalType: 'uint256', name: '_requiredApprovals', type: 'uint256' },
    ],
    name: 'createApproval',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_approvalId', type: 'uint256' }],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_approvalId', type: 'uint256' }],
    name: 'isApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_approvalId', type: 'uint256' }],
    name: 'getApprovalStatus',
    outputs: [
      { internalType: 'uint256', name: 'approvalCount', type: 'uint256' },
      { internalType: 'uint256', name: 'requiredApprovals', type: 'uint256' },
      { internalType: 'bool', name: 'isApprovedStatus', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextApprovalId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const MNEE_TOKEN_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
