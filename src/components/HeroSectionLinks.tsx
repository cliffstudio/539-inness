/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface LinksHeroProps {
  id?: string
  heading?: string
  body?: PortableTextBlock[]
  image?: SanityImageSource
}

export default function HeroSectionLinks({ id, heading, body, image }: LinksHeroProps) {
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

      <div className="hero-content h-pad out-of-view">
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

