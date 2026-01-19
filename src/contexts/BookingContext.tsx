'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type BookingTab = 'room' | 'table' | 'golf' | 'spa'

interface BookingContextType {
  isOpen: boolean
  activeTab: BookingTab
  openBooking: (tab?: BookingTab) => void
  closeBooking: () => void
  setActiveTab: (tab: BookingTab) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<BookingTab>('room')

  const openBooking = (tab: BookingTab = 'room') => {
    setActiveTab(tab)
    setIsOpen(true)
  }

  const closeBooking = () => {
    setIsOpen(false)
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

