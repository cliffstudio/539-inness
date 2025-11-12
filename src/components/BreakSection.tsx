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
        <section id={id} className="break-section layout-1 relative scale-container">
          {image && (
            <div className="fill-space-image-wrap media-wrap scale-element">
              <img 
                data-src={urlFor(image).url()} 
                alt="" 
                className="lazy full-bleed-image scale-element"
              />
              <div className="loading-overlay" />
            </div>
          )}

          <div className="break-content h-pad">
            <h6 className="out-of-opacity">{subHeading}</h6>

            {heading && (
              <h1 className="break-heading out-of-opacity">{heading}</h1>
            )}

            {body && body.length > 0 && (
              <div className="break-body body-bigger out-of-opacity">
                <PortableText value={body} />
              </div>
            )}
          </div>
        </section>
      )}

      {layout === 'split' && (
        <section id={id} className={`break-section layout-2 row-lg h-pad background-${resolvedBackgroundColor === 'black' ? 'black' : resolvedBackgroundColor === 'green' ? 'green' : 'orange'}`}>
          <div className="col-6-12_lg out-of-opacity">
            <div className="break-content">
              <h6 className="desktop">{subHeading}</h6>
              
              {subHeading && <h6 className="mobile">{subHeading}</h6>}

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
            <div className="col-6-12_lg out-of-opacity">
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

