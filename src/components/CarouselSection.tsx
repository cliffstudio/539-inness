'use client'

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { urlFor } from '@/sanity/utils/imageUrlBuilder'
import mediaLazyloading from '../utils/lazyLoad'
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
  const validImages = useMemo(
    () => images?.filter((image) => image?.asset?._ref) ?? [],
    [images]
  )

  useLayoutEffect(() => {
    const splideElement = splideRef.current
    if (!splideElement || validImages.length === 0) return

    if (splideInstance.current) {
      splideInstance.current.destroy()
    }

    splideInstance.current = new Splide(splideElement, {
      type: 'loop',
      gap: '1.25em',
      arrows: false,
      pagination: false,
      autoplay: false,
      drag: true,
      preloadPages: 4,
      autoScroll: {
        speed: 1,
        pauseOnHover: false,
      },
    })

    splideInstance.current.mount({ AutoScroll })
    mediaLazyloading().then((instance) => instance?.update())

    return () => {
      if (splideInstance.current) {
        splideInstance.current.destroy()
        splideInstance.current = null
      }
    }
  }, [validImages])

  if (validImages.length === 0) {
    return null
  }

  return (
    <section className="carousel-section">
      <div ref={splideRef} className="splide carousel-section__splide">
        <div className="splide__track">
          <ul className="splide__list">
            {validImages.map((image, index) => {
              const imageUrl = urlFor(image)
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
