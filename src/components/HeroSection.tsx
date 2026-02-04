/* eslint-disable @next/next/no-img-element */
'use client'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'
import SplideCarousel from './SplideCarousel'

interface Spec {
  body?: string
}

interface HeroProps {
  id?: string
  layout?: 'full-bleed' | 'split'
  heading?: string
  body?: PortableTextBlock[]
  images?: SanityImage[]
  specs?: Spec[]
  button?: Link
}

export default function Hero({ id, layout = 'full-bleed', heading, body, images, specs, button }: HeroProps) {
  const handleArrowClick = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {layout === 'full-bleed' && (
        <section id={id} className="hero-section layout-1 relative">
          {images && images.length > 0 && (
            images.length === 1 ? (
              <div className="fill-space-image-wrap media-wrap">
                <img 
                  data-src={urlFor(images[0]).url()} 
                  alt="" 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            ) : (
              <SplideCarousel 
                images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                onPrevious={() => {}}
                onNext={() => {}}
              />
            )
          )}

          <div className="hero-content h-pad">
            <div className="out-of-opacity stage-1">
              {heading && <h1>{heading}</h1>}
              
              {body && body.length > 0 && (
                <div className="hero-body">
                  <PortableText value={body} />
                </div>
              )}
            </div>
          </div>
          
          <div className="hero-arrow out-of-opacity stage-2" onClick={handleArrowClick} style={{ cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)"/>
              <path d="M24 15.5L17.5 22L11 15.5"/>
            </svg>
          </div>
        </section>
      )}

      {layout === 'split' && (
        <section id={id} className="hero-section layout-2 h-pad">
          {images && images.length > 0 && (
            <div className="hero-image relative out-of-opacity">
              {images.length === 1 ? (
                <div className="fill-space-image-wrap media-wrap">
                  <img 
                    data-src={urlFor(images[0]).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              ) : (
                <SplideCarousel 
                  images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                  onPrevious={() => {}}
                  onNext={() => {}}
                />
              )}
            </div>
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

            {(specs || button) && (
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
                
                {button && (
                  <ButtonLink link={button} fallbackColor="outline" />
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}

