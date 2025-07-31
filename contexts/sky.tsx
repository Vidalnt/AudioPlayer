"use client"
import { createContext, useContext, useRef, ReactNode } from "react"

interface CloudData {
  x: number
  y: number
  width: number
  height: number
  speed: number
  isVisible: boolean
  zIndex: number
}

interface SkyContextType {
  cloudsRef: React.MutableRefObject<CloudData[]>
  registerCloudUpdate: (callback: () => void) => void
  unregisterCloudUpdate: (callback: () => void) => void
}

const SkyContext = createContext<SkyContextType | null>(null)

export function SkyProvider({ children }: { children: ReactNode }) {
  const cloudsRef = useRef<CloudData[]>([])
  const updateCallbacks = useRef<Set<() => void>>(new Set())

  const registerCloudUpdate = (callback: () => void) => {
    updateCallbacks.current.add(callback)
  }

  const unregisterCloudUpdate = (callback: () => void) => {
    updateCallbacks.current.delete(callback)
  }

  const notifyCloudUpdate = () => {
    updateCallbacks.current.forEach(callback => callback())
  }

  return (
    <SkyContext.Provider value={{ 
      cloudsRef, 
      registerCloudUpdate, 
      unregisterCloudUpdate 
    }}>
      {children}
    </SkyContext.Provider>
  )
}

export const useSkyContext = () => {
  const context = useContext(SkyContext)
  if (!context) {
    throw new Error('useSkyContext must be used within SkyProvider')
  }
  return context
}