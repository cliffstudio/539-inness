'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

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
  clearBasket: () => void
  getTotal: () => number
  getItemCount: () => number
  isSyncing: boolean
}

const BasketContext = createContext<BasketContextType | undefined>(undefined)

const STORAGE_KEY = 'inness-basket'

// Helper function to load basket from localStorage
function loadBasketFromStorage(): BasketItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load basket from localStorage:', error)
  }
  return []
}

// Helper function to save basket to localStorage
function saveBasketToStorage(items: BasketItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save basket to localStorage:', error)
  }
}

// Sync basket with Shopify cart
async function syncBasketWithShopify(items: BasketItem[]): Promise<void> {
  try {
    // Get current cart to check if it exists
    const cartResponse = await fetch('/api/shopify/cart', {
      method: 'GET',
    })

    let cartId: string | undefined
    if (cartResponse.ok) {
      const cartData = await cartResponse.json()
      if (cartData.cart) {
        cartId = cartData.cart.id
        // Remove all existing lines
        const lineIds = cartData.cart.lines.map((line: { id: string }) => line.id)
        if (lineIds.length > 0) {
          await fetch(`/api/shopify/cart?lineIds=${lineIds.join(',')}`, {
            method: 'DELETE',
          })
        }
      }
    }

    // Add all current items
    if (items.length > 0) {
      const response = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId,
          items: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to sync basket with Shopify:', error)
      }
    }
  } catch (error) {
    console.error('Error syncing basket with Shopify:', error)
  }
}

// Get current cart from Shopify to find line IDs
async function getCartFromShopify(): Promise<{ id: string; lines: Array<{ id: string; variantId: string; quantity: number }> } | null> {
  try {
    const response = await fetch('/api/shopify/cart', {
      method: 'GET',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.cart || null
  } catch (error) {
    console.error('Error getting cart from Shopify:', error)
    return null
  }
}

// Remove item from Shopify cart
async function removeFromShopifyCart(variantId: number): Promise<void> {
  try {
    const cart = await getCartFromShopify()
    if (!cart) return

    // Find the line ID for this variant
    const line = cart.lines.find((l: { variantId: string }) => 
      parseInt(l.variantId, 10) === variantId
    )

    if (!line) return

    const response = await fetch(`/api/shopify/cart?lineIds=${line.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to remove item from Shopify cart:', error)
    }
  } catch (error) {
    console.error('Error removing item from Shopify cart:', error)
  }
}

// Update quantity in Shopify cart
async function updateQuantityInShopifyCart(variantId: number, quantity: number): Promise<void> {
  try {
    const cart = await getCartFromShopify()
    
    if (!cart) {
      // If no cart exists, create one with this item
      const response = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ variantId, quantity }],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to create cart with item:', error)
      }
      return
    }

    // Find the line ID for this variant
    const line = cart.lines.find((l: { variantId: string }) => 
      parseInt(l.variantId, 10) === variantId
    )

    if (!line) {
      // Line doesn't exist, add it
      const response = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ variantId, quantity }],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to add item to Shopify cart:', error)
      }
      return
    }

    // Update existing line
    const response = await fetch('/api/shopify/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartId: cart.id,
        updates: [{ lineId: line.id, quantity }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to update quantity in Shopify cart:', error)
    }
  } catch (error) {
    console.error('Error updating quantity in Shopify cart:', error)
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  // Start with empty array to match server render (prevents hydration mismatch)
  const [items, setItems] = useState<BasketItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load basket from localStorage after hydration (client-side only)
  useEffect(() => {
    const savedItems = loadBasketFromStorage()
    if (savedItems.length > 0) {
      // Check if we're returning from checkout by verifying if Shopify cart is empty
      // If we have local items but Shopify cart is empty, checkout was completed
      getCartFromShopify()
        .then((cart) => {
          if (!cart || cart.lines.length === 0) {
            // Cart is empty but we have local items - checkout was completed
            // Clear the local basket
            setItems([])
            if (typeof window !== 'undefined') {
              try {
                localStorage.removeItem(STORAGE_KEY)
              } catch (error) {
                console.error('Failed to clear basket from localStorage:', error)
              }
            }
          } else {
            // Cart has items, sync with Shopify
            setItems(savedItems)
            syncBasketWithShopify(savedItems).catch(console.error)
          }
          setIsHydrated(true)
        })
        .catch((error) => {
          // If we can't check the cart, assume items are still valid and sync
          console.error('Error checking cart status:', error)
          setItems(savedItems)
          syncBasketWithShopify(savedItems).catch(console.error)
          setIsHydrated(true)
        })
    } else {
      setIsHydrated(true)
    }
  }, [])

  // Save basket to localStorage whenever items change (but only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    
    if (items.length > 0) {
      saveBasketToStorage(items)
    } else {
      // Clear localStorage when basket is empty
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch (error) {
          console.error('Failed to clear basket from localStorage:', error)
        }
      }
    }
  }, [items, isHydrated])

  const openBasket = () => {
    setIsOpen(true)
  }

  const closeBasket = () => {
    setIsOpen(false)
  }

  const addToBasket = useCallback(async (item: Omit<BasketItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.variantId === item.variantId)
      
      if (existingItem) {
        // If item already exists, increase quantity
        const newQuantity = existingItem.quantity + 1
        const updated = prevItems.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: newQuantity }
            : i
        )
        // Update quantity in Shopify
        setIsSyncing(true)
        updateQuantityInShopifyCart(item.variantId, newQuantity).finally(() => setIsSyncing(false))
        return updated
      } else {
        // Add new item with quantity 1
        const updated = [...prevItems, { ...item, quantity: 1 }]
        // Add to Shopify cart
        setIsSyncing(true)
        ;(async () => {
          try {
            await fetch('/api/shopify/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                items: [{ variantId: item.variantId, quantity: 1 }],
              }),
            })
          } catch (error) {
            console.error('Error adding item to Shopify cart:', error)
          } finally {
            setIsSyncing(false)
          }
        })()
        return updated
      }
    })
    setIsOpen(true)
  }, [])

  const removeFromBasket = useCallback(async (variantId: number) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((i) => i.variantId !== variantId)
      // Sync with Shopify
      setIsSyncing(true)
      removeFromShopifyCart(variantId).finally(() => setIsSyncing(false))
      return updated
    })
  }, [])

  const updateQuantity = useCallback(async (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(variantId)
      return
    }
    
    setItems((prevItems) => {
      const updated = prevItems.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      )
      // Sync with Shopify
      setIsSyncing(true)
      updateQuantityInShopifyCart(variantId, quantity).finally(() => setIsSyncing(false))
      return updated
    })
  }, [removeFromBasket])

  const clearBasket = useCallback(() => {
    setItems([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Failed to clear basket from localStorage:', error)
      }
    }
  }, [])

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
        clearBasket,
        getTotal,
        getItemCount,
        isSyncing,
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
