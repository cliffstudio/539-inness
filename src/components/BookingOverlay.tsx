/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { useBooking } from '../contexts/BookingContext'
import { DisableBodyScroll, EnableBodyScroll } from '@/utils/bodyScroll'
import type { BookingTab } from '../contexts/BookingContext'
import mediaLazyloading from '../utils/lazyLoad'

import bookGolfImage from '@/app/images/book-golf-image.jpg'
import bookRoomImage from '@/app/images/book-room-image.jpg'
import bookSpaImage from '@/app/images/book-spa-image.jpg'
import bookTableImage from '@/app/images/book-table-image.jpg'


export default function BookingOverlay() {
  const { isOpen, activeTab, setActiveTab } = useBooking()
  const overlayRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)


  // Handle body scroll lock when overlay is open
  useEffect(() => {
    if (isOpen) {
      DisableBodyScroll()
      // Trigger lazy loading update when overlay opens to observe new images
      // Small delay to ensure DOM is updated
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

  // Handle overlay animations
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
      const duration = 250 // 250ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        overlay.style.opacity = progress.toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          overlay.style.opacity = '1'
          // Step 2: After overlay is fully visible, fade in inner-wrap
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
      const duration = 250 // 250ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        innerWrap.style.opacity = (1 - progress).toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          innerWrap.style.opacity = '0'
          // Step 2: After inner-wrap is fully hidden, fade out overlay
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

  const tabs: { id: BookingTab; label: string; image: string }[] = [
    { id: 'room', label: 'Book a room', image: bookRoomImage.src },
    { id: 'table', label: 'Book a table', image: bookTableImage.src },
    { id: 'golf', label: 'Book a tee time', image: bookGolfImage.src },
    { id: 'spa', label: 'Book a treatment', image: bookSpaImage.src },
  ]

  if (!isOpen) return null

  return (
    <div ref={overlayRef} className="booking-overlay">
      <div ref={innerWrapRef} className="booking-overlay__inner-wrap">
        <div className="booking-overlay__content">
          <div className="booking-overlay__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`booking-overlay__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="booking-overlay__tab-image">
                  <img 
                    data-src={tab.image} 
                    alt={tab.label}
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
                <div className="booking-overlay__tab-label">{tab.label}</div>
              </button>
            ))}
          </div>

          <div className="booking-overlay__tab-content">
            {activeTab === 'room' && (
              <div className="booking-overlay__form">
                {/* Embed room booking form here */}
                <p>Room booking form will be embedded here</p>
              </div>
            )}

            {activeTab === 'table' && (
              <div className="booking-overlay__form">
                {/* Embed table booking form here */}
                <p>Table booking form will be embedded here</p>
              </div>
            )}

            {activeTab === 'golf' && (
              <div className="booking-overlay__form">
                <iframe
                  className="chronogolf-iframe"
                  src="https://www.chronogolf.com/club/18790/widget?medium=widget&source=club"
                  width="100%"
                  height="800"
                  title="Book A Tee Time"
                  frameBorder="0"
                />
              </div>
            )}

            {activeTab === 'spa' && (
              <div className="booking-overlay__form">
                {/* Embed spa reservation form here */}
                <p>Spa reservation form will be embedded here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

