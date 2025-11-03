/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface ActivitiesHeroProps {
  id?: string
  activitiesHeading?: string
  activitiesBody?: PortableTextBlock[]
  activitiesImage?: SanityImageSource
}

export default function HeroSectionActivities({ id, activitiesHeading, activitiesBody, activitiesImage }: ActivitiesHeroProps) {
  return (
    <section id={id} className="hero-section layout-1 relative">
      {activitiesImage && (
        <div className="fill-space-image-wrap media-wrap">
          <img 
            data-src={urlFor(activitiesImage).url()} 
            alt="" 
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />
        </div>
      )}

      <div className="hero-content h-pad">
        {activitiesHeading && <h1>{activitiesHeading}</h1>}
        
        {activitiesBody && activitiesBody.length > 0 && (
          <div className="hero-body">
            <PortableText value={activitiesBody} />
          </div>
        )}
      </div>

      <div className="hero-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)" stroke="#FFF9ED"/>
          <path d="M24 15.5L17.5 22L11 15.5" stroke="#FFF9ED"/>
        </svg>
      </div>
    </section>
  )
}

