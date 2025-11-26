'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export type BookingTab = 'room' | 'table' | 'golf' | 'spa'

interface BookingContextType {
  isOpen: boolean
  activeTab: BookingTab
  openBooking: (tab?: BookingTab) => void
  closeBooking: () => void
  setActiveTab: (tab: BookingTab) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Map URL parameter values to BookingTab values
const urlTabMap: Record<string, BookingTab> = {
  'room': 'room',
  'table': 'table',
  'golf': 'golf',
  'spa': 'spa',
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<BookingTab>('room')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Check for booking parameter in URL on mount and when it changes
  useEffect(() => {
    const bookingParam = searchParams.get('booking')
    if (bookingParam) {
      const tab = urlTabMap[bookingParam.toLowerCase()]
      if (tab) {
        setActiveTab(tab)
        setIsOpen(true)
      }
    }
  }, [searchParams])

  const openBooking = (tab: BookingTab = 'room') => {
    setActiveTab(tab)
    setIsOpen(true)
    // Update URL with booking parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('booking', tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const closeBooking = () => {
    setIsOpen(false)
    // Remove booking parameter from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('booking')
    const newUrl = params.toString() 
      ? `${pathname}?${params.toString()}`
      : pathname
    router.push(newUrl, { scroll: false })
  }

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        activeTab,
        openBooking,
        closeBooking,
        setActiveTab,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

