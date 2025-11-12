'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react'
import { urlFor } from '@/sanity/utils/imageUrlBuilder'
import Splide from '@splidejs/splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import '@splidejs/splide/css'

interface CarouselSectionProps {
  images?: Array<{
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }>
}

export default function CarouselSection({ images }: CarouselSectionProps) {
  const splideRef = useRef<HTMLDivElement>(null)
  const splideInstance = useRef<Splide | null>(null)

  useEffect(() => {
    if (splideRef.current && images && images.length > 0) {
      // Destroy existing instance if it exists
      if (splideInstance.current) {
        splideInstance.current.destroy()
      }

      // Create new Splide instance
      splideInstance.current = new Splide(splideRef.current, {
        type: 'loop',
        gap: '1.25em',
        arrows: false,
        pagination: false,
        autoplay: false,
        drag: false,
        preloadPages: 4,
        autoScroll: {
          speed: 1,
          pauseOnHover: false,
        },
      })

      // Mount with AutoScroll extension
      splideInstance.current.mount({ AutoScroll })

      // Cleanup on unmount
      return () => {
        if (splideInstance.current) {
          splideInstance.current.destroy()
        }
      }
    }
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <section className="carousel-section">
      <div ref={splideRef} className="splide carousel-section__splide out-of-opacity">
        <div className="splide__track">
          <ul className="splide__list">
            {images.map((image, index) => {
              const imageUrl = urlFor(image.asset)
                .width(1200)
                .height(800)
                .fit('crop')
                .quality(85)
                .url()

              return (
                <li key={index} className="splide__slide">
                  <img 
                    data-src={imageUrl}
                    alt=""
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
