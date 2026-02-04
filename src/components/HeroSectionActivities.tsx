/* eslint-disable @next/next/no-img-element */
'use client'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import SplideCarousel from './SplideCarousel'

interface ActivitiesHeroProps {
  id?: string
  activitiesHeading?: string
  activitiesBody?: PortableTextBlock[]
  activitiesImages?: SanityImage[]
}

export default function HeroSectionActivities({ id, activitiesHeading, activitiesBody, activitiesImages }: ActivitiesHeroProps) {
  const handleArrowClick = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <section id={id} className="hero-section layout-1 relative">
      {activitiesImages && activitiesImages.length > 0 && (
        activitiesImages.length === 1 ? (
          <>
            <img 
              data-src={urlFor(activitiesImages[0]).url()} 
              alt="" 
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </>
        ) : (
          <SplideCarousel 
            images={activitiesImages.map(image => ({ url: urlFor(image).url(), alt: "" }))}
            onPrevious={() => {}}
            onNext={() => {}}
          />
        )
      )}

      <div className="hero-content h-pad">
        <div className="out-of-opacity stage-1">
          {activitiesHeading && <h1>{activitiesHeading}</h1>}
          
          {activitiesBody && activitiesBody.length > 0 && (
            <div className="hero-body">
              <PortableText value={activitiesBody} />
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

