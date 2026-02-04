/* eslint-disable @next/next/no-img-element */
'use client'

import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import SplideCarousel from './SplideCarousel'

interface Spec {
  body?: string
}

interface HeroProps {
  id?: string
  title?: string
  images?: SanityImageSource[]
  description?: PortableTextBlock[]
  specs?: Spec[]
}

export default function Hero({ id, title, images, description, specs }: HeroProps) {
  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {images && images.length > 0 && (
        images.length === 1 ? (
          <div className="hero-image relative out-of-opacity">
            <div className="media-wrap">
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
        {(title || description) && (
          <div className="row-1">
            {title && <h3>{title}</h3>}
            
            {description && description.length > 0 && (
              <div className="hero-body">
                <PortableText value={description} />
              </div>
            )}
          </div>
        )}

        <div className="row-2">
          {specs && specs.length > 0 && (
            <div className="hero-specs">
              {specs.map((spec, index) => (
                <div key={index} className="spec-item">
                  {spec.body}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="button button--orange namastay-widget-button"
          >
            Book
          </button>
        </div>
      </div>
    </section>
  )
}

