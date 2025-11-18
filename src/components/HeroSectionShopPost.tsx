/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface HeroProps {
  id?: string
  title?: string
  image?: SanityImageSource
}

export default function HeroSectionShopPost({ id, title, image }: HeroProps) {
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
        {title && (
          <div className="row-1">
            <h3>{title}</h3>
          </div>
        )}
      </div>
    </section>
  )
}

