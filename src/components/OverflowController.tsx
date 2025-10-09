"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function OverflowController() {
  const pathname = usePathname()

  useEffect(() => {
    // Set overflow control based on current route
    const isHomepage = pathname === '/' || pathname === ''
    
    if (isHomepage) {
      // Keep overflow hidden on homepage (CSS default)
      document.documentElement.classList.remove('scroll-enabled')
    } else {
      // Enable scrolling on non-homepage
      document.documentElement.classList.add('scroll-enabled')
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
