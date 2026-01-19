/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { useBooking } from '../contexts/BookingContext'
import { DisableBodyScroll, EnableBodyScroll } from '@/utils/bodyScroll'

import bookGolfImage from '@/app/images/book-golf-image.jpg'
import bookRoomImage from '@/app/images/book-room-image.jpg'
import bookSpaImage from '@/app/images/book-spa-image.jpg'
import bookTableImage from '@/app/images/book-table-image.jpg'


export default function BookingOverlay() {
  const { isOpen, closeBooking } = useBooking()
  const overlayRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Handle body scroll lock when overlay is open
  useEffect(() => {
    if (isOpen) {
      DisableBodyScroll()
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

  const handleRoomClick = () => {
    // Find or create a Namastay widget button and trigger it
    const namastayButton = document.querySelector('.namastay-widget-button') as HTMLButtonElement
    if (namastayButton) {
      namastayButton.click()
    } else {
      // Fallback: create a temporary button with the class and click it
      const tempButton = document.createElement('button')
      tempButton.className = 'namastay-widget-button'
      tempButton.style.position = 'fixed'
      tempButton.style.left = '-9999px'
      tempButton.style.opacity = '0'
      document.body.appendChild(tempButton)
      tempButton.click()
      setTimeout(() => document.body.removeChild(tempButton), 100)
    }
    closeBooking()
  }

  const handleTableClick = () => {
    window.open('https://resy.com/cities/accord-ny/venues/inness', '_blank', 'noopener,noreferrer')
    closeBooking()
  }

  const handleGolfClick = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    window.open(`https://www.chronogolf.com/club/inness-resort?date=${dateString}`, '_blank', 'noopener,noreferrer')
    closeBooking()
  }

  const handleSpaClick = () => {
    window.location.href = 'mailto:spa@inness.co'
    closeBooking()
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const loadingOverlay = img.nextElementSibling as HTMLElement
    if (loadingOverlay && loadingOverlay.classList.contains('loading-overlay')) {
      loadingOverlay.classList.add('hidden')
    }
  }

  const tabs = [
    { id: 'room', label: 'Book a room', image: bookRoomImage.src, onClick: handleRoomClick },
    { id: 'table', label: 'Book a table', image: bookTableImage.src, onClick: handleTableClick },
    { id: 'golf', label: 'Book a tee time', image: bookGolfImage.src, onClick: handleGolfClick },
    { id: 'spa', label: 'Book a treatment', image: bookSpaImage.src, onClick: handleSpaClick },
  ]

  if (!isOpen) return null

  return (
    <div ref={overlayRef} className="booking-overlay">
      <div ref={innerWrapRef} className="booking-overlay__inner-wrap">
        <div className="booking-overlay__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="booking-overlay__tab"
              onClick={tab.onClick}
            >
              <div className="booking-overlay__tab-image">
                <img 
                  src={tab.image} 
                  alt={tab.label}
                  className="full-bleed-image"
                  onLoad={handleImageLoad}
                />
                <div className="loading-overlay" />
              </div>
              <div className="booking-overlay__tab-label">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

