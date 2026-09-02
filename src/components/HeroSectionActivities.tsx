/* eslint-disable @next/next/no-img-element */
'use client'
import { useRef } from 'react'
import AnimateIn from './AnimateIn'
import { useGsapParallaxScroll } from '@/hooks/useGsapParallaxScroll'
import { urlForHero } from '../sanity/utils/imageUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import BackgroundVideo from './BackgroundVideo'
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
  const sectionRef = useRef<HTMLElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)

  useGsapParallaxScroll(imageWrapRef, sectionRef, {
    enabled: calendarMediaType === 'image' && (calendarImages?.length ?? 0) === 1,
  })

  const handleArrowClick = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <section ref={sectionRef} id={id} className="hero-section layout-1 relative">
      {calendarMediaType === 'video' && calendarVideo && (
        <div className="fill-space-video-wrap media-wrap">
          <BackgroundVideo video={calendarVideo} />
        </div>
      )}
      {calendarMediaType === 'image' && calendarImages && calendarImages.length > 0 && (
        calendarImages.length === 1 ? (
          <div ref={imageWrapRef} className="fill-space-image-wrap media-wrap">
            <img 
              data-src={urlForHero(calendarImages[0])} 
              alt="" 
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </div>
        ) : (
          <SplideCarousel 
            images={calendarImages.map(image => ({ url: urlForHero(image), alt: "" }))}
            onPrevious={() => {}}
            onNext={() => {}}
          />
        )
      )}

      <div className="hero-content h-pad">
        <AnimateIn stage={1}>
          {calendarHeading && <h1>{calendarHeading}</h1>}
          
          {calendarBody && calendarBody.length > 0 && (
            <div className="hero-body">
              <PortableText value={calendarBody} />
            </div>
          )}
        </AnimateIn>
      </div>

      <AnimateIn
        className="hero-arrow"
        stage={2}
        onClick={handleArrowClick}
        style={{ cursor: 'pointer' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)" stroke="#FFF9ED"/>
          <path d="M24 15.5L17.5 22L11 15.5" stroke="#FFF9ED"/>
        </svg>
      </AnimateIn>
    </section>
  )
}

