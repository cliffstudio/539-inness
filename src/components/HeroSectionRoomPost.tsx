/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface Spec {
  body?: string
}

interface HeroProps {
  id?: string
  title?: string
  image?: SanityImageSource
  description?: PortableTextBlock[]
  specs?: Spec[]
}

export default function Hero({ id, title, image, description, specs }: HeroProps) {
  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {image && (
        <div className="hero-image relative out-of-opacity">
          <div className="fill-space-image-wrap media-wrap">
            <img 
              data-src={urlFor(image).url()} 
              alt="" 
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </div>
        </div>
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
          
          {/* todo: add check availability button */}
          <div className="button button--orange">
            Book
          </div>
        </div>
      </div>
    </section>
  )
}

