'use client'

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2,
  History
} from 'lucide-react'
import { useAccount, usePublicClient } from 'wagmi'
import { useEffect, useState } from 'react'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

interface TransactionHistory {
  hash: string
  type: 'flow_creation' | 'approval' | 'payment' | 'milestone' | 'split' | 'other'
  status: 'success' | 'failed' | 'pending'
  timestamp: number
  description: string
  amount?: string
  to?: string
  error?: string
}

const TRANSACTION_STORAGE_KEY = 'payflow_transaction_history'

function getTransactionType(functionName: string, to: string): TransactionHistory['type'] {
  if (to.toLowerCase() === CONTRACT_ADDRESSES.FLOW_FACTORY?.toLowerCase()) {
    if (functionName.includes('create')) return 'flow_creation'
    return 'other'
  }
  if (to.toLowerCase() === CONTRACT_ADDRESSES.MNEE_TOKEN?.toLowerCase()) {
    if (functionName.includes('approve')) return 'approval'
    return 'other'
  }
  if (to.toLowerCase().startsWith('0x') && to.length === 42) {
    return 'payment'
  }
  return 'other'
}

function getTransactionDescription(type: TransactionHistory['type'], functionName?: string): string {
  switch (type) {
    case 'flow_creation':
      if (functionName?.includes('Milestone')) return 'Created Milestone Payment Flow'
      if (functionName?.includes('Split')) return 'Created Revenue Split Flow'
      if (functionName?.includes('Recurring')) return 'Created Recurring Payment Flow'
      return 'Created Payment Flow'
    case 'approval':
      return 'Approved MNEE Token'
    case 'payment':
      return 'Payment Transaction'
    case 'milestone':
      return 'Milestone Payment'
    case 'split':
      return 'Split Payment'
    default:
      return 'Transaction'
  }
}

export default function HistoryPage() {
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient()
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setTransactions([])
      return
    }

    const stored = localStorage.getItem(`${TRANSACTION_STORAGE_KEY}_${address}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTransactions(parsed.filter((t: TransactionHistory) => t.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000))
      } catch {
        setTransactions([])
      }
    }
  }, [address])

  const saveTransaction = (tx: TransactionHistory) => {
    if (!address) return
    const stored = localStorage.getItem(`${TRANSACTION_STORAGE_KEY}_${address}`) || '[]'
    const existing = JSON.parse(stored) as TransactionHistory[]
    const updated = [tx, ...existing.filter(t => t.hash !== tx.hash)].slice(0, 100)
    localStorage.setItem(`${TRANSACTION_STORAGE_KEY}_${address}`, JSON.stringify(updated))
    setTransactions(updated)
  }

  const fetchTransactionStatus = async (hash: string) => {
    if (!publicClient || !chainId) return null
    
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` })
      return receipt.status === 'success' ? 'success' : 'failed'
    } catch {
      return null
    }
  }

  const refreshTransactions = async () => {
    if (!address || !publicClient || transactions.length === 0) return
    setIsLoading(true)
    
    try {
      const updated = await Promise.all(
        transactions.map(async (tx) => {
          if (tx.status === 'pending') {
            const status = await fetchTransactionStatus(tx.hash)
            if (status) {
              return { ...tx, status }
            }
          }
          return tx
        })
      )
      
      const hasChanges = updated.some((tx, i) => 
        i < transactions.length && tx.status !== transactions[i].status
      )
      
      if (hasChanges) {
        localStorage.setItem(`${TRANSACTION_STORAGE_KEY}_${address}`, JSON.stringify(updated))
        setTransactions(updated as TransactionHistory[])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isConnected || !address) return

    const handleTransaction = (event: CustomEvent) => {
      const { hash, type, functionName, to, amount, status } = event.detail
      const txType = type || getTransactionType(functionName || '', to || '')
      const description = getTransactionDescription(txType, functionName)
      
      saveTransaction({
        hash,
        type: txType,
        status: status || 'pending',
        timestamp: Date.now(),
        description,
        amount,
        to,
      })
    }

    window.addEventListener('payflow:transaction' as any, handleTransaction as EventListener)
    return () => {
      window.removeEventListener('payflow:transaction' as any, handleTransaction as EventListener)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(() => {
      refreshTransactions()
    }, 10000)
    return () => clearInterval(interval)
  }, [isConnected, address, publicClient, chainId])

  const getExplorerUrl = (hash: string) => {
    if (chainId === 11155111) {
      return `https://sepolia.etherscan.io/tx/${hash}`
    }
    return `https://etherscan.io/tx/${hash}`
  }

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">Transaction History</h1>
            <p className="text-sm text-muted-foreground">View all your transaction attempts</p>
          </div>
        </div>
        <div className="pt-6 px-4">
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please connect your wallet to view transaction history</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">Transaction History</h1>
          <p className="text-sm text-muted-foreground">View all your transaction attempts (successful and failed)</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshTransactions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="pt-6 px-4">
        <Card className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium mb-1">No transaction history</p>
                <p className="text-sm text-muted-foreground">
                  Your transaction attempts will appear here as you interact with the app.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, idx) => {
                const Icon = tx.status === 'success' ? CheckCircle2 : tx.status === 'failed' ? XCircle : Clock
                return (
                  <div key={tx.hash}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                          p-2 rounded-full
                          ${tx.status === 'success' ? 'bg-green-500/10' : tx.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'}
                        `}
                      >
                        <Icon
                          className={`
                            h-4 w-4
                            ${tx.status === 'success' ? 'text-green-500' : tx.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}
                          `}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{tx.description}</div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                tx.status === 'success' ? 'default' : 
                                tx.status === 'failed' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {tx.status}
                            </Badge>
                            <a
                              href={getExplorerUrl(tx.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 font-mono break-all">
                          {tx.hash}
                        </p>
                        {tx.amount && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Amount: {tx.amount} MNEE
                          </p>
                        )}
                        {tx.error && (
                          <p className="text-sm text-red-500 mb-1">
                            Error: {tx.error}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {idx < transactions.length - 1 && <Separator className="mt-4" />}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
