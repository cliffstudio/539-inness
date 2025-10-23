"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function OverflowController() {
  const pathname = usePathname()

  useEffect(() => {
    // Enable scrolling on all pages
    document.documentElement.classList.add('scroll-enabled')
  }, [pathname])

  // This component doesn't render anything
  return null
}
