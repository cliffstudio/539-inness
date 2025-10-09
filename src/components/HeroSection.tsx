import { SanityImage } from '../types/sanity'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface Link {
  linkType?: 'internal' | 'external'
  label?: string
  href?: string
  pageLink?: {
    slug?: string
    title?: string
  }
}

interface Spec {
  body?: string
}

interface HeroSectionProps {
  layout?: 'layout-1' | 'layout-2'
  heading?: string
  body?: PortableTextBlock[]
  image?: SanityImageSource
  specs?: Spec[]
  button?: Link
}

export default function HeroSection({ layout = 'layout-1', heading, body, image, specs, button }: HeroSectionProps) {
  return (
    <section className={`hero-section ${layout}`}>
      {image && (
        <div className="fill-space-image-wrap media-wrap">
          <img 
            src={urlFor(image).url()} 
            alt={heading || ''} 
            className="full-bleed-image"
          />
        </div>
      )}

      <div className="hero-content">
        {heading && <h1>{heading}</h1>}
        
        {body && body.length > 0 && (
          <div className="hero-body">
            <PortableText value={body} />
          </div>
        )}

        {specs && specs.length > 0 && (
          <div className="hero-specs">
            {specs.map((spec, index) => (
              <div key={index} className="spec-item">
                {spec.body}
              </div>
            ))}
          </div>
        )}
        
        {button && (
          <a 
            href={button.linkType === 'external' ? button.href : `/${button.pageLink?.slug}`}
            className="hero-button"
          >
            {button.linkType === 'external' ? button.label : button.pageLink?.title}
          </a>
        )}
      </div>
    </section>
  )
}

