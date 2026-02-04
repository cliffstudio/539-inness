/* eslint-disable @next/next/no-img-element */
'use client'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import SplideCarousel from './SplideCarousel'

interface LinksHeroProps {
  id?: string
  heading?: string
  body?: PortableTextBlock[]
  images?: SanityImage[]
}

export default function HeroSectionLinks({ id, heading, body, images }: LinksHeroProps) {
  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {images && images.length > 0 && (
        images.length === 1 ? (
          <div className="hero-image relative out-of-opacity">
            <div className="fill-space-image-wrap media-wrap">
              <img 
                data-src={urlFor(images[0]).url()} 
                alt="" 
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          </div>
        ) : (
          <div className="hero-image relative out-of-opacity">
            <SplideCarousel 
              images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
              onPrevious={() => {}}
              onNext={() => {}}
            />
          </div>
        )
      )}

      <div className="hero-content out-of-opacity">
        {(heading || body) && (
          <div className="row-1">
            {heading && <h3>{heading}</h3>}
            
            {body && body.length > 0 && (
              <div className="hero-body">
                <PortableText value={body} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

