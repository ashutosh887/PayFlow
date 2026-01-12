'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, dismissToast }: { toasts: Toast[]; dismissToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-500/10 border-green-500/20 text-green-600',
    error: 'bg-red-500/10 border-red-500/20 text-red-600',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
  }

  const Icon = icons[toast.type]

  return (
    <Card className={`p-4 border-2 ${colors[toast.type]} animate-in slide-in-from-right`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{toast.title}</div>
          {toast.description && (
            <div className="text-xs mt-1 opacity-80">{toast.description}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 shrink-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
