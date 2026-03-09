/* eslint-disable @next/next/no-img-element */
'use client'
import { useRef, useLayoutEffect } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import SplideCarousel from './SplideCarousel'

interface ActivitiesHeroProps {
  id?: string
  calendarHeading?: string
  calendarBody?: PortableTextBlock[]
  calendarMediaType?: 'image' | 'video'
  calendarImages?: SanityImage[]
  calendarVideo?: SanityVideo
}

export default function HeroSectionActivities({ id, calendarHeading, calendarBody, calendarMediaType = 'image', calendarImages, calendarVideo }: ActivitiesHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    if (calendarMediaType !== 'video' || !videoRef.current) return
    const el = videoRef.current
    const hideOverlay = () => {
      const overlay = el.nextElementSibling
      if (overlay && overlay instanceof HTMLElement) overlay.classList.add('hidden')
    }
    el.addEventListener('canplaythrough', hideOverlay)
    if (el.readyState >= 3) hideOverlay()
    return () => el.removeEventListener('canplaythrough', hideOverlay)
  }, [calendarMediaType])

  const handleArrowClick = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <section id={id} className="hero-section layout-1 relative">
      {calendarMediaType === 'video' && calendarVideo && (
        <div className="fill-space-video-wrap media-wrap">
          <video
            ref={videoRef}
            src={videoUrlFor(calendarVideo)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="loading-overlay" />
        </div>
      )}
      {calendarMediaType === 'image' && calendarImages && calendarImages.length > 0 && (
        calendarImages.length === 1 ? (
          <>
            <img 
              data-src={urlFor(calendarImages[0]).url()} 
              alt="" 
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </>
        ) : (
          <SplideCarousel 
            images={calendarImages.map(image => ({ url: urlFor(image).url(), alt: "" }))}
            onPrevious={() => {}}
            onNext={() => {}}
          />
        )
      )}

      <div className="hero-content h-pad">
        <div className="out-of-opacity stage-1">
          {calendarHeading && <h1>{calendarHeading}</h1>}
          
          {calendarBody && calendarBody.length > 0 && (
            <div className="hero-body">
              <PortableText value={calendarBody} />
            </div>
          )}
        </div>
      </div>

      <div className="hero-arrow out-of-opacity stage-2" onClick={handleArrowClick} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)" stroke="#FFF9ED"/>
          <path d="M24 15.5L17.5 22L11 15.5" stroke="#FFF9ED"/>
        </svg>
      </div>
    </section>
  )
}

