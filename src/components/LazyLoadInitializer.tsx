'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import mediaLazyloading from '../utils/lazyLoad'

export default function LazyLoadInitializer() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize lazy loading on mount
    mediaLazyloading()
  }, [])

  useEffect(() => {
    // Re-initialize lazy loading when route changes
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      mediaLazyloading()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
