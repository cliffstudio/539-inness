'use client'

import { useRef, useState, useEffect } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import Link from 'next/link'
import Image from 'next/image'
import mediaLazyloading from '../utils/lazyLoad'

interface Shop {
  _id: string
  title?: string
  image?: SanityImage
  slug?: string
}

interface ShopSectionProps {
  id?: string
  layout?: 'single-shop' | '2-shops' | '4-shops'
  heading?: string
  shops: Shop[]
  disableCarousel?: boolean
}

interface SplideRefWithInstance {
  go: (direction: string) => void
  splide?: {
    index: number
    length: number
    on: (event: string, callback: () => void) => void
    off: (event: string, callback: () => void) => void
  }
}

export default function ShopSection({ 
  id,
  layout = '4-shops',
  heading,
  shops,
  disableCarousel = false,
}: ShopSectionProps) {
  const splideRef = useRef<SplideRefWithInstance | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isAtEndOfShops, setIsAtEndOfShops] = useState(false)

  // Determine grid column class based on layout and count
  const getGridColumnClass = () => {
    if (layout === 'single-shop') {
      return 'col-12-12_lg'
    } else if (layout === '2-shops') {
      return 'col-6-12_lg'
    } else {
      // For 4-shops layout, handle any number of shops
      if (shops.length === 3) {
        return 'col-4-12_lg'
      }
      return 'col-3-12_lg'
    }
  }

  const handlePrevious = () => {
    if (splideRef.current) {
      splideRef.current.go('-1')
    }
  }

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('+1')
    }
  }

  useEffect(() => {
    if (!disableCarousel && splideRef.current) {
      const splideInstance = splideRef.current.splide
      if (splideInstance) {
        const updatePagination = () => {
          const index = splideInstance.index || 0
          setCurrentSlideIndex(index)
          setCurrentPage(index + 1)
          setTotalPages(splideInstance.length || 1)
          setIsAtEndOfShops(index >= (splideInstance.length || 0) - 1)
        }

        splideInstance.on('moved', updatePagination)
        updatePagination()

        return () => {
          splideInstance.off('moved', updatePagination)
        }
      }
    }
  }, [disableCarousel, shops])

  // Re-initialize lazy loading when shops change
  useEffect(() => {
    const timer = setTimeout(() => {
      mediaLazyloading().catch(console.error)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [shops])

  const renderShopContent = (shop: Shop) => (
    <>
      {shop.image && (
        <div className="shop-image media-wrap">
          <Link href={`/shop/${shop.slug || ''}`}>
            <Image 
              src={urlFor(shop.image).url()} 
              alt={shop.title || ''} 
              className="full-bleed-image"
              width={800}
              height={600}
              style={{ width: '100%', height: 'auto' }}
            />
            <div className="loading-overlay" />
          </Link>
        </div>
      )}

      {shop.title && (
        <div className="shop-title">
          <Link href={`/shop/${shop.slug || ''}`}>
            <h5>{shop.title}</h5>
          </Link>
        </div>
      )}
    </>
  )

  if (shops.length === 0) {
    return null
  }

  return (
    <section id={id} className={`shop-section layout-${layout}${disableCarousel ? ' no-carousel' : ''} h-pad`}>
      {heading && (
        <div className="shop-section-heading out-of-opacity">
          <h4>{heading}</h4>
        </div>
      )}

      <div className={`row-lg shop-grid layout-${layout}`}>
        {shops.map((shop) => (
          <div 
            key={shop._id} 
            className={`shop-item ${getGridColumnClass()} out-of-opacity`}
          >
            {renderShopContent(shop)}
          </div>
        ))}
      </div>

      {!disableCarousel && (
        <div className={`shop-carousel layout-${layout}`}>
          <Splide
            ref={splideRef}
            options={{
              type: 'slide',
              perPage: 1,
              perMove: 1,
              gap: '20px',
              pagination: false,
              arrows: false,
              breakpoints: {
                768: {
                  perPage: 1,
                  perMove: 1,
                },
              },
            }}
          >
            {shops.map((shop) => (
              <SplideSlide key={`carousel-${shop._id}`}>
                <div className="shop-item out-of-opacity">
                  {renderShopContent(shop)}
                </div>
              </SplideSlide>
            ))}
          </Splide>

          {shops.length > 1 && (
            <div className="shop-carousel-controls">
              <button 
                className="carousel-arrow carousel-arrow--prev"
                onClick={handlePrevious}
                disabled={currentSlideIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="17.5"/>
                  <path d="M20.5 12L14 18.5L20.5 25"/>
                </svg>
              </button>

              <div className="carousel-pagination">
                <h6>{currentPage}/{totalPages}</h6>
              </div>

              <button 
                className="carousel-arrow carousel-arrow--next"
                onClick={handleNext}
                disabled={isAtEndOfShops}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17.5" transform="matrix(-1 0 0 1 36 0)"/>
                  <path d="M15.5 12L22 18.5L15.5 25"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

