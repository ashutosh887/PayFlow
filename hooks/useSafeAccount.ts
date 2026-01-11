"use client"

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

export function useSafeAccount() {
  const [mounted, setMounted] = useState(false)
  const account = useAccount()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return { isConnected: false, isConnecting: false, address: undefined, isDisconnected: true }
  }

  return account
}
