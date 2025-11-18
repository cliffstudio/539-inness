"use client"

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function OverflowController() {
  const pathname = usePathname()

  // Use useLayoutEffect to run synchronously before paint
  useLayoutEffect(() => {
    // Enable scrolling immediately on all pages
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('scroll-enabled')
    }
  }, [pathname])

  // Also ensure it's set in useEffect as a fallback
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('scroll-enabled')
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
