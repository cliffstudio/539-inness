import Image from 'next/image'
import { urlFor } from '../../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface Link {
  linkType?: 'internal' | 'external'
  label?: string
  href?: string
  pageLink?: {
    slug?: string
    title?: string
  }
}

interface HeroSectionProps {
  heading?: string
  subheading?: string
  image?: SanityImageSource
  cta?: Link
}

export function HeroSection({ heading, subheading, image, cta }: HeroSectionProps) {
  return (
    <section style={{ 
      position: 'relative',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: 'white',
      overflow: 'hidden'
    }}>
      {image && (
        <div style={{ 
          position: 'absolute',
          inset: 0,
          zIndex: -1
        }}>
          <Image
            src={urlFor(image).width(1920).height(1080).url()}
            alt={heading || 'Hero image'}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)'
          }} />
        </div>
      )}
      <div style={{ 
        padding: '2rem',
        maxWidth: '800px',
        zIndex: 1
      }}>
        {heading && <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>{heading}</h1>}
        {subheading && <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{subheading}</p>}
        {cta && (
          <a
            href={cta.linkType === 'external' ? cta.href : `/${cta.pageLink?.slug}`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'white',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            {cta.linkType === 'external' ? cta.label : cta.pageLink?.title}
          </a>
        )}
      </div>
    </section>
  )
}

