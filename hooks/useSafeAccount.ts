"use client"

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

export function useSafeAccount() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  try {
    const account = useAccount()
    return mounted ? account : { isConnected: false, isConnecting: false, address: undefined }
  } catch {
    return { isConnected: false, isConnecting: false, address: undefined }
  }
}
