/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState, useRef } from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { urlFor } from '@/sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import ButtonLink from './ButtonLink'
import { Link } from '../types/footerSettings'

interface AnnouncementSlide {
  image?: SanityImage
  title?: string
  text?: string
  button?: Link
}

interface AnnouncementPopupSectionProps {
  enabled?: boolean
  slides?: AnnouncementSlide[]
}

const STORAGE_KEY = 'announcement-popup-closed'

export default function AnnouncementPopupSection({ enabled, slides }: AnnouncementPopupSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)

  useEffect(() => {
    // Check if popup is enabled and has slides
    if (!enabled || !slides || slides.length === 0) {
      return
    }

    // Check if popup was previously closed
    const wasClosed = localStorage.getItem(STORAGE_KEY) === 'true'
    
    // Only show if it hasn't been closed
    if (!wasClosed) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        setIsVisible(true)
      }, 100)
    }
  }, [enabled, slides])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem(STORAGE_KEY, 'true')
    }, 300) // Match animation duration
  }

  const handlePrevious = () => {
    if (splideRef.current) {
      splideRef.current.go('<')
    }
  }

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>')
    }
  }

  if (!enabled || !slides || slides.length === 0 || !isVisible) {
    return null
  }

  const splideOptions = {
    type: 'fade' as const,
    rewind: true,
    arrows: false,
    pagination: true,
    lazyLoad: 'nearby' as const,
    autoplay: false,
    interval: 0,
    pauseOnHover: false,
    resetProgress: false,
  }

  return (
    <div className={`announcement-popup ${isClosing ? 'closing' : ''}`}>
      <div className="announcement-popup__content">
        <div 
          className="announcement-popup__close body-tiny" 
          onClick={handleClose}
          aria-label="Close announcement"
        >
          Close
        </div>
        
        <Splide
          ref={splideRef}
          options={splideOptions}
          className="announcement-popup__carousel"
        >
          {slides
            .filter((slide) => slide.image?.asset)
            .map((slide, index) => {
              const imageUrl = urlFor(slide.image!.asset)
                .width(800)
                .height(600)
                .fit('crop')
                .quality(85)
                .url()

              return (
                <SplideSlide key={index}>
                  <div className="announcement-popup__slide">
                    {imageUrl && (
                      <div className="announcement-popup__image relative">
                        <img 
                          src={imageUrl} 
                          alt={slide.title || ''} 
                          className="full-bleed-image"
                        />

                        {slide.button && (
                          <div className="button-wrap button-wrap--overlay-media">
                            <ButtonLink link={slide.button} fallbackColor="cream" />
                          </div>
                        )}
                      </div>
                    )}
                    {(slide.title || slide.text) && (
                      <div className="announcement-popup__text-content">
                        {slide.title && (
                          <div className="announcement-popup__title body-medium bolder">{slide.title}</div>
                        )}

                        {slide.text && (
                          <p className="announcement-popup__text body-small">{slide.text}</p>
                        )}
                      </div>
                    )}
                  </div>
                </SplideSlide>
              )
            })}
        </Splide>

        {slides.length > 1 && (
          <>
            <button 
              className="announcement-popup__nav announcement-popup__nav--prev" 
              onClick={handlePrevious}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button 
              className="announcement-popup__nav announcement-popup__nav--next" 
              onClick={handleNext}
              aria-label="Next slide"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  )
}

