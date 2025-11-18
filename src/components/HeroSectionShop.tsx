/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface HeroProps {
  id?: string
  shopHeading?: string
  shopBody?: PortableTextBlock[]
  shopImage?: SanityImageSource
}

export default function Hero({ id, shopHeading, shopBody, shopImage }: HeroProps) {
  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {shopImage && (
        <div className="hero-image relative out-of-opacity">
          <div className="fill-space-image-wrap media-wrap">
            <img 
              data-src={urlFor(shopImage).url()} 
              alt="" 
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </div>
        </div>
      )}

      <div className="hero-content out-of-opacity">
        {(shopHeading || shopBody) && (
          <div className="row-1">
            {shopHeading && <h3>{shopHeading}</h3>}
            
            {shopBody && shopBody.length > 0 && (
              <div className="hero-body">
                <PortableText value={shopBody} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

