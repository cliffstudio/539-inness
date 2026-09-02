'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getPageClass = () => {
    const cleanPath = pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-')

    if (cleanPath === '') return 'page-home'
    return `page-${cleanPath}`
  }

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return <main className={getPageClass()}>{children}</main>
}
