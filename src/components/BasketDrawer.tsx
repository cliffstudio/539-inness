/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useBasket } from '../contexts/BasketContext'
import { DisableBodyScroll, EnableBodyScroll } from '@/utils/bodyScroll'
import mediaLazyloading from '../utils/lazyLoad'
import QuantityDropdown from './QuantityDropdown'

const SHOPIFY_STORE_URL = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || 'https://inness-hotel.myshopify.com'

export default function BasketDrawer() {
  const { isOpen, items, closeBasket, removeFromBasket, updateQuantity, getTotal } = useBasket()
  const overlayRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [giftCardCode, setGiftCardCode] = useState('')
  const [shouldRender, setShouldRender] = useState(false)

  // Handle body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) {
      DisableBodyScroll()
      // Trigger lazy loading update when drawer opens
      const timer = setTimeout(() => {
        mediaLazyloading().catch(console.error)
      }, 100)
      
      return () => {
        clearTimeout(timer)
        EnableBodyScroll()
      }
    } else {
      EnableBodyScroll()
    }

    return () => {
      EnableBodyScroll()
    }
  }, [isOpen])

  // Handle render state - keep component mounted during closing animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  // Handle drawer animations
  useEffect(() => {
    const overlay = overlayRef.current
    const innerWrap = innerWrapRef.current

    if (!overlay || !innerWrap) return

    // Clear any existing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (isOpen) {
      // Opening animation - animate both overlay and drawer simultaneously
      overlay.style.pointerEvents = 'all'
      innerWrap.style.pointerEvents = 'none'

      const startTime = performance.now()
      const duration = 250

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Fade in overlay background
        overlay.style.opacity = progress.toString()
        
        // Slide drawer in from left
        innerWrap.style.transform = `translateX(${(1 - progress) * -100}%)`

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          overlay.style.opacity = '1'
          innerWrap.style.transform = 'translateX(0)'
          innerWrap.style.pointerEvents = 'all'
          animationFrameRef.current = null
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else if (shouldRender) {
      // Closing animation - fade out overlay and slide drawer back
      innerWrap.style.pointerEvents = 'none'
      overlay.style.pointerEvents = 'none'

      const startTime = performance.now()
      const duration = 250

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Slide drawer out to left
        innerWrap.style.transform = `translateX(${-progress * 100}%)`
        
        // Fade out overlay background
        overlay.style.opacity = (1 - progress).toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          innerWrap.style.transform = 'translateX(-100%)'
          overlay.style.opacity = '0'
          overlay.style.pointerEvents = 'none'
          animationFrameRef.current = null
          // Unmount component after animation completes
          setShouldRender(false)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isOpen, shouldRender])

  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
      // Fetch the cart from Shopify to get the checkout URL
      const response = await fetch('/api/shopify/cart', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }

      const data = await response.json()
      
      if (data.cart?.checkoutUrl) {
        // Redirect to Shopify checkout
        window.location.href = data.cart.checkoutUrl
      } else {
        // Fallback: if no cart exists, create one and then redirect
        const createResponse = await fetch('/api/shopify/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            items: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }),
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create cart')
        }

        const createData = await createResponse.json()
        if (createData.checkoutUrl) {
          window.location.href = createData.checkoutUrl
        } else {
          throw new Error('No checkout URL received')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback to old method if API fails
      const cartItems = items.map(item => `${item.variantId}:${item.quantity}`).join(',')
      const checkoutUrl = `${SHOPIFY_STORE_URL}/cart/${cartItems}`
      window.location.href = checkoutUrl
    }
  }

  const subtotal = getTotal()
  // These would typically come from Shopify, but for now we'll use estimates
  const estimatedShipping = 7.95
  const salesTax = subtotal * 0.196 // Approximate tax rate (19.6%)
  const total = subtotal + estimatedShipping + salesTax

  if (!shouldRender) return null

  return (
    <div className="basket-drawer">
      <div 
        ref={overlayRef} 
        className="basket-drawer__overlay"
        onClick={closeBasket}
        aria-label="Close basket"
      />
      <div ref={innerWrapRef} className="basket-drawer__inner-wrap">
        <div className="basket-drawer__header">
          <h5 className="basket-drawer__title">Basket</h5>

          <button
            type="button"
            className="basket-drawer__close"
            onClick={closeBasket}
            aria-label="Close basket"
          >
            Close
          </button>
        </div>

        <div className="basket-drawer__content">
          {items.length === 0 ? (
            <div className="basket-drawer__empty">
              <p>Your basket is empty</p>
            </div>
          ) : (
            <>
              <div className="basket-drawer__items">
                {items.map((item) => (
                  <div key={item.variantId} className="basket-drawer__item">
                    {item.imageUrl && (
                      <div className="basket-drawer__item-image">
                        <img
                          data-src={item.imageUrl}
                          alt={item.title}
                          className="lazy"
                        />
                        <div className="loading-overlay" />
                      </div>
                    )}
                    <div className="basket-drawer__item-details">
                      <div className="basket-drawer__item-title body-big">{item.title}</div>

                      <div className="basket-drawer__item-meta">
                        {item.variantTitle && (
                          <div className="basket-drawer__item-variant">
                            {item.variantTitle.toLowerCase() === 'default title' 
                              ? 'One Size' 
                              : item.variantTitle}
                          </div>
                        )}

                        <div className="basket-drawer__item-quantity">
                          <QuantityDropdown
                            id={`quantity-${item.variantId}`}
                            value={item.quantity}
                            onChange={(newQuantity) => updateQuantity(item.variantId, newQuantity)}
                            max={10}
                          />
                        </div>
                      </div>
                        
                      <div className="basket-drawer__item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        className="basket-drawer__item-remove"
                        onClick={() => removeFromBasket(item.variantId)}
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" fill="none">
                          <path d="M4.47672 4.8676L3.99446 4.8885L4.34035 14.3275L4.82262 14.3066L4.47672 4.8676ZM9.75166 14.4704L8.77716 15.4913H3.17295L2.24834 14.5226L1.29047 4.85366L0.81153 4.90592L1.78603 14.7561L2.97339 16H8.97339L10.2106 14.7038L11.1851 4.90592L10.7062 4.85366L9.74834 14.4739L9.75166 14.4704ZM9.41907 2.69686V1.59582C9.41907 0.714286 8.73392 0 7.89579 0H4.10421C3.26275 0 2.58093 0.714286 2.58093 1.59582V2.69686H0V3.20209H12V2.69686H9.41907ZM8.93681 2.69686H3.06319V1.59582C3.06319 0.993031 3.52882 0.505226 4.10421 0.505226H7.89579C8.47117 0.505226 8.93681 0.993031 8.93681 1.59582V2.69686ZM7.39357 4.87108L7.07428 14.3101L7.55654 14.3275L7.87583 4.8885L7.39357 4.87108Z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="basket-drawer__summary">
                <div className="basket-drawer__summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="basket-drawer__summary-row">
                  <span>Estimated Shipping</span>
                  <span>${estimatedShipping.toFixed(2)}</span>
                </div>
                <div className="basket-drawer__summary-row">
                  <span>Sales Tax</span>
                  <span>${salesTax.toFixed(2)}</span>
                </div>
                <div className="basket-drawer__summary-row basket-drawer__summary-row--total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* <div className="basket-drawer__giftcard">
                <p>Have a giftcard?</p>
                <input
                  type="text"
                  placeholder="Redeem your code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="basket-drawer__giftcard-input"
                />
              </div> */}

              <div className="basket-drawer__actions">
                <button
                  type="button"
                  className="basket-drawer__checkout button button--orange"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>

                <div>Looking for more? <button className="basket-drawer__continue" onClick={closeBasket}>Continue shopping</button></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
