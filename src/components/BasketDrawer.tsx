/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useBasket } from '../contexts/BasketContext'
import { DisableBodyScroll, EnableBodyScroll } from '@/utils/bodyScroll'
import mediaLazyloading from '../utils/lazyLoad'

const SHOPIFY_STORE_URL = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || 'https://inness-hotel.myshopify.com'

export default function BasketDrawer() {
  const { isOpen, items, closeBasket, removeFromBasket, updateQuantity, getTotal } = useBasket()
  const overlayRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [giftCardCode, setGiftCardCode] = useState('')

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
      // Opening animation
      overlay.style.pointerEvents = 'all'
      innerWrap.style.pointerEvents = 'none'

      const startTime = performance.now()
      const duration = 250

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        overlay.style.opacity = progress.toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          overlay.style.opacity = '1'
          innerWrap.style.pointerEvents = 'all'
          const innerStartTime = performance.now()

          const animateInner = (currentTime: number) => {
            const elapsed = currentTime - innerStartTime
            const progress = Math.min(elapsed / duration, 1)

            innerWrap.style.opacity = progress.toString()

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateInner)
            } else {
              innerWrap.style.opacity = '1'
              animationFrameRef.current = null
            }
          }

          animationFrameRef.current = requestAnimationFrame(animateInner)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // Closing animation
      innerWrap.style.pointerEvents = 'none'

      const startTime = performance.now()
      const duration = 250

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        innerWrap.style.opacity = (1 - progress).toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          innerWrap.style.opacity = '0'
          overlay.style.pointerEvents = 'none'
          const overlayStartTime = performance.now()

          const animateOverlay = (currentTime: number) => {
            const elapsed = currentTime - overlayStartTime
            const progress = Math.min(elapsed / duration, 1)

            overlay.style.opacity = (1 - progress).toString()

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateOverlay)
            } else {
              overlay.style.opacity = '0'
              animationFrameRef.current = null
            }
          }

          animationFrameRef.current = requestAnimationFrame(animateOverlay)
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
  }, [isOpen])

  const handleCheckout = () => {
    if (items.length === 0) return

    // Build Shopify checkout URL with cart items
    // Format: https://{store}.myshopify.com/cart/{variant_id}:{quantity},{variant_id}:{quantity}
    const cartItems = items.map(item => `${item.variantId}:${item.quantity}`).join(',')
    const checkoutUrl = `${SHOPIFY_STORE_URL}/cart/${cartItems}`
    
    // Redirect to Shopify checkout
    window.location.href = checkoutUrl
  }

  const subtotal = getTotal()
  // These would typically come from Shopify, but for now we'll use estimates
  const estimatedShipping = 7.95
  const salesTax = subtotal * 0.196 // Approximate tax rate (19.6%)
  const total = subtotal + estimatedShipping + salesTax

  if (!isOpen) return null

  return (
    <div ref={overlayRef} className="basket-drawer">
      <div ref={innerWrapRef} className="basket-drawer__inner-wrap">
        <div className="basket-drawer__header">
          <h2 className="basket-drawer__title">Basket</h2>
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
                      <div className="basket-drawer__item-title">{item.title}</div>
                      {item.variantTitle && (
                        <div className="basket-drawer__item-variant">{item.variantTitle}</div>
                      )}
                      <div className="basket-drawer__item-controls">
                        <div className="basket-drawer__item-quantity">
                          <label htmlFor={`quantity-${item.variantId}`}>Qty:</label>
                          <select
                            id={`quantity-${item.variantId}`}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10))}
                            className="basket-drawer__quantity-select"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="basket-drawer__item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="basket-drawer__item-remove"
                        onClick={() => removeFromBasket(item.variantId)}
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                          <path d="M2 4h12M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2m3 0v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4h14zM7 8v6M9 8v6"/>
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

              <div className="basket-drawer__giftcard">
                <p>Have a giftcard?</p>
                <input
                  type="text"
                  placeholder="Redeem your code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="basket-drawer__giftcard-input"
                />
              </div>

              <div className="basket-drawer__actions">
                <button
                  type="button"
                  className="basket-drawer__checkout button button--orange"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
                <button
                  type="button"
                  className="basket-drawer__continue"
                  onClick={closeBasket}
                >
                  Looking for more? Continue shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
