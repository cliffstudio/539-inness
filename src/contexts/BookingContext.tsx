'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type BookingTab = 'room' | 'table' | 'golf' | 'spa'

interface BookingContextType {
  isOpen: boolean
  activeTab: BookingTab
  openBooking: (tab?: BookingTab) => void
  closeBooking: () => void
  setActiveTab: (tab: BookingTab) => void
  openNamastayDrawer: () => void
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

  const openNamastayDrawer = () => {
    const namastayButton = document.querySelector('.namastay-widget-button') as HTMLButtonElement
    if (namastayButton) {
      namastayButton.click()
    } else {
      const tempButton = document.createElement('button')
      tempButton.className = 'namastay-widget-button'
      tempButton.style.position = 'fixed'
      tempButton.style.left = '-9999px'
      tempButton.style.opacity = '0'
      document.body.appendChild(tempButton)
      tempButton.click()
      setTimeout(() => document.body.removeChild(tempButton), 100)
    }
  }

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        activeTab,
        openBooking,
        closeBooking,
        setActiveTab,
        openNamastayDrawer,
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

