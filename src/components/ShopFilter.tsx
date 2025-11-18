'use client'

import { useEffect } from 'react'
import ShopSection from './ShopSection'
import mediaLazyloading from '../utils/lazyLoad'
import { SanityImage } from '../types/sanity'

interface Shop {
  _id: string
  title?: string
  image?: SanityImage
  slug?: string
}

interface ShopFilterProps {
  shops: Shop[]
  layout?: 'single-shop' | '2-shops' | '4-shops'
}

export default function ShopFilter({ shops, layout = '4-shops' }: ShopFilterProps) {
  // Re-initialize lazy loading when shops change
  useEffect(() => {
    const timer = setTimeout(() => {
      mediaLazyloading().catch(console.error)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [shops])

  return (
    <ShopSection layout={layout} shops={shops} disableCarousel={true} />
  )
}

