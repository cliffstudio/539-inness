'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    const scrollToHash = () => {
      if (!window.location.hash) return

      const target = document.querySelector(window.location.hash)
      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

    const handleHashLinkClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href*="#"]')
      if (!(link instanceof HTMLAnchorElement)) return

      const href = link.getAttribute('href')
      if (!href?.includes('#')) return

      const hash = href.split('#')[1]
      if (!hash) return

      const element = document.getElementById(hash)
      if (!element) return

      event.preventDefault()
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      history.pushState(null, '', href)
    }

    const timeoutId = window.setTimeout(scrollToHash, 100)
    document.addEventListener('click', handleHashLinkClick)
    window.addEventListener('popstate', scrollToHash)

    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('click', handleHashLinkClick)
      window.removeEventListener('popstate', scrollToHash)
    }
  }, [pathname])

  return null
}
