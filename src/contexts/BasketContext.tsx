'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface BasketItem {
  variantId: number
  productGid: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
  variantTitle?: string
  sku?: string
}

interface BasketContextType {
  isOpen: boolean
  items: BasketItem[]
  openBasket: () => void
  closeBasket: () => void
  addToBasket: (item: Omit<BasketItem, 'quantity'>) => void
  removeFromBasket: (variantId: number) => void
  updateQuantity: (variantId: number, quantity: number) => void
  getTotal: () => number
  getItemCount: () => number
}

const BasketContext = createContext<BasketContextType | undefined>(undefined)

export function BasketProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<BasketItem[]>([])

  const openBasket = () => {
    setIsOpen(true)
  }

  const closeBasket = () => {
    setIsOpen(false)
  }

  const addToBasket = (item: Omit<BasketItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.variantId === item.variantId)
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
    setIsOpen(true)
  }

  const removeFromBasket = (variantId: number) => {
    setItems((prevItems) => prevItems.filter((i) => i.variantId !== variantId))
  }

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(variantId)
      return
    }
    
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      )
    )
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <BasketContext.Provider
      value={{
        isOpen,
        items,
        openBasket,
        closeBasket,
        addToBasket,
        removeFromBasket,
        updateQuantity,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </BasketContext.Provider>
  )
}

export function useBasket() {
  const context = useContext(BasketContext)
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider')
  }
  return context
}
