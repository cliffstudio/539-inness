/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'

interface BreakProps {
  id?: string
  layout?: 'full-bleed' | 'split'
  subHeading?: string
  heading?: string
  body?: PortableTextBlock[]
  image?: SanityImageSource
  button?: Link
  backgroundColor?: 'black' | 'green' | 'orange'
}

export default function Hero({ id, layout = 'full-bleed', subHeading, heading, body, image, button, backgroundColor }: BreakProps) {
  const resolvedBackgroundColor = backgroundColor ?? 'black'
  return (
    <>
      {layout === 'full-bleed' && (
        <section id={id} className="break-section layout-1 relative">
          {image && (
            <div className="fill-space-image-wrap media-wrap">
              <img 
                data-src={urlFor(image).url()} 
                alt="" 
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          )}

          <div className="break-content">
            <h6>{subHeading}</h6>

            {heading && (
              <h1 className="break-heading">{heading}</h1>
            )}

            {body && body.length > 0 && (
              <div className="break-body body-bigger">
                <PortableText value={body} />
              </div>
            )}
          </div>
        </section>
      )}

      {layout === 'split' && (
        <section id={id} className={`break-section layout-2 row-lg h-pad background-${resolvedBackgroundColor === 'black' ? 'black' : resolvedBackgroundColor === 'green' ? 'green' : 'orange'}`}>
          <div className="col-6-12_lg">
            <div className="break-content">
              <h6>{subHeading}</h6>

              {heading && (
                <h1>{heading}</h1>
              )}

              {(body || button) && (
                <div>
                  {body && body.length > 0 && (
                    <div className="break-body">
                      <PortableText value={body} />
                    </div>
                  )}

                  {button && (
                    <ButtonLink link={button} fallbackColor="outline" />
                  )}
                </div>
              )}
            </div>
          </div>

          {image && (
            <div className="col-6-12_lg">
              <div className="break-image relative">
                <div className="fill-space-image-wrap media-wrap">
                  <img 
                    data-src={urlFor(image).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

