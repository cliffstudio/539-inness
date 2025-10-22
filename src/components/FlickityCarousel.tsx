'use client'

import { useEffect, useRef } from 'react'

// Define Flickity interface for type safety
interface FlickityInstance {
  previous(): void
  next(): void
  destroy(): void
}

interface FlickityOptions {
  cellAlign?: string
  contain?: boolean
  wrapAround?: boolean
  prevNextButtons?: boolean
  pageDots?: boolean
  lazyLoad?: boolean
  adaptiveHeight?: boolean
  fade?: boolean
}

interface FlickityCarouselProps {
  images: Array<{ url: string; alt?: string }>
  onPrevious: () => void
  onNext: () => void
}

export default function FlickityCarousel({ images, onPrevious, onNext }: FlickityCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const flickityInstance = useRef<FlickityInstance | null>(null)

  useEffect(() => {
    if (carouselRef.current && images.length > 1) {
      // Dynamically import Flickity only on client side
      const initializeFlickity = async () => {
        // Import Flickity library
        const Flickity = (await import('flickity')).default
        
        // Initialize Flickity with fade
        const options: FlickityOptions = {
          cellAlign: 'left',
          contain: true,
          wrapAround: true,
          prevNextButtons: false,
          pageDots: false,
          lazyLoad: true,
          adaptiveHeight: true,
          fade: true,
        }
        
        flickityInstance.current = new Flickity(carouselRef.current!, options) as FlickityInstance
      }

      initializeFlickity()

      // Cleanup function
      return () => {
        if (flickityInstance.current) {
          flickityInstance.current.destroy()
          flickityInstance.current = null
        }
      }
    }
  }, [images])

  const handlePrevious = () => {
    if (flickityInstance.current) {
      flickityInstance.current.previous()
    }
    onPrevious()
  }

  const handleNext = () => {
    if (flickityInstance.current) {
      flickityInstance.current.next()
    }
    onNext()
  }

  return (
    <div className="carousel-container">
      <div ref={carouselRef} className="flickity-carousel">
        {images.map((image, index) => (
          <div key={index} className="carousel-cell">
            <img
              data-flickity-lazyload={image.url} 
              alt={image.alt || ""}
              className="lazy"
            />
          </div>
        ))}
      </div>
      <div className="carousel-hover-left" onClick={handlePrevious}></div>
      <div className="carousel-hover-right" onClick={handleNext}></div>
    </div>
  )
}
