'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'

export default function BodyFadeIn() {
  const pathname = usePathname()
  const isInitialMount = useRef(true)
  const previousPathname = useRef(pathname)

  // Set opacity to 0 immediately on route change (before paint)
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      // Check if pathname actually changed
      if (previousPathname.current !== pathname) {
        // Route change detected - immediately hide content
        document.body.style.transition = 'none'
        document.body.style.opacity = '0'
        previousPathname.current = pathname
      } else if (isInitialMount.current) {
        // Initial mount - ensure body starts at opacity 0
        document.body.style.opacity = '0'
        document.body.style.transition = 'none'
      }
    }
  }, [pathname])

  // Fade in after route change or initial mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fadeIn = () => {
        // Set transition for smooth fade-in
        document.body.style.transition = 'opacity 300ms cubic-bezier(0.25,0.1,0.25,1)'
        // Use requestAnimationFrame to ensure transition is applied before changing opacity
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.style.opacity = '1'
          })
        })
      }

      if (isInitialMount.current) {
        // Initial load - fade in after a brief delay
        const timeoutId = setTimeout(fadeIn, 100)
        isInitialMount.current = false
        return () => clearTimeout(timeoutId)
      } else {
        // Route change - wait for DOM to update, then fade in
        // Increased delay to ensure new content is fully rendered
        const timeoutId = setTimeout(fadeIn, 150)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [pathname])

  return null
}