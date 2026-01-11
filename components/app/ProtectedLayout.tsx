"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSafeAccount } from "@/hooks/useSafeAccount"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { isConnected, isConnecting } = useSafeAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConnecting && !isConnected) {
      router.push('/')
    }
  }, [mounted, isConnected, isConnecting, router])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Connecting wallet...</div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return null
  }

  return <>{children}</>
}
