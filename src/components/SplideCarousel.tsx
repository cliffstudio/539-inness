'use client'

import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { useRef } from 'react'

interface SplideCarouselProps {
  images: Array<{ url: string; alt?: string }>
  onPrevious: () => void
  onNext: () => void
}

export default function SplideCarousel({ images, onPrevious, onNext }: SplideCarouselProps) {
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)

  const handlePrevious = () => {
    if (splideRef.current) {
      splideRef.current.go('<')
    }
    onPrevious()
  }

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>')
    }
    onNext()
  }

  const splideOptions = {
    type: 'fade' as const,
    rewind: true,
    arrows: false,
    pagination: false,
    lazyLoad: 'nearby' as const,
    autoplay: false,
    interval: 0,
    pauseOnHover: false,
    resetProgress: false,
  }

  return (
    <div className="carousel-container">
      <Splide
        ref={splideRef}
        options={splideOptions}
        className="splide-carousel"
      >
        {images.map((image, index) => (
          <SplideSlide key={index}>
            <img
              data-src={image.url}
              alt={image.alt || ""}
              className="lazy"
            />
          </SplideSlide>
        ))}
      </Splide>
      <div className="carousel-hover-left" onClick={handlePrevious}></div>
      <div className="carousel-hover-right" onClick={handleNext}></div>
    </div>
  )
}
