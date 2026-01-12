'use client'

export interface FlowMetadata {
  name: string
  description?: string
  createdAt: number
}

const STORAGE_KEY = 'payflow_flow_metadata'

export function getFlowMetadata(flowAddress: string): FlowMetadata | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const metadata = JSON.parse(stored) as Record<string, FlowMetadata>
    return metadata[flowAddress.toLowerCase()] || null
  } catch {
    return null
  }
}

export function setFlowMetadata(flowAddress: string, metadata: Partial<FlowMetadata>): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const existing = stored ? (JSON.parse(stored) as Record<string, FlowMetadata>) : {}
    
    const current = existing[flowAddress.toLowerCase()] || {
      name: `Flow ${flowAddress.slice(0, 6)}...${flowAddress.slice(-4)}`,
      createdAt: Date.now(),
    }
    
    existing[flowAddress.toLowerCase()] = {
      ...current,
      ...metadata,
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Failed to save flow metadata:', error)
  }
}

export function deleteFlowMetadata(flowAddress: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    
    const existing = JSON.parse(stored) as Record<string, FlowMetadata>
    delete existing[flowAddress.toLowerCase()]
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Failed to delete flow metadata:', error)
  }
}

export function getAllFlowMetadata(): Record<string, FlowMetadata> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Record<string, FlowMetadata>) : {}
  } catch {
    return {}
  }
}
