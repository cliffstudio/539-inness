"use client"

/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'

interface Feature {
  image?: SanityImageSource
  heading?: string
  body?: PortableTextBlock[]
  links?: Link[]
}

interface FeatureSectionProps {
  id?: string
  subHeading?: string
  heading?: string
  features?: Feature[]
}

export default function FeatureSection({ 
  id,
  subHeading,
  heading,
  features,
}: FeatureSectionProps) {
  if (!features || features.length === 0) {
    return null
  }

  return (
    <section id={id} className="feature-section h-pad">
      {(subHeading || heading) && (
        <div className="feature-section-header">
          {subHeading && (
            <div className="feature-section-subheading">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
                <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                <path d="M0.5 0.5L11.8181 15.5"/>
                <path d="M23.1365 0.5H11.8184V15.5H23.1365V0.5Z"/>
                <path d="M11.8184 0.5L23.1365 15.5"/>
              </svg>

              <div>{subHeading}</div>
            </div>
          )}

          {heading && (
            <h4 className="feature-section-heading">{heading}</h4>
          )}
        </div>
      )}

      <div className="feature-grid row-lg">
        {features.map((feature, index) => (
          <div key={index} className="feature-item col-3-12_lg">
            {feature.image && (
              <div className="media-wrap">
                <img 
                  data-src={urlFor(feature.image).url()} 
                  alt="" 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />

                {feature.links && feature.links.length > 0 && (
                  <div className={`button-wrap button-wrap--overlay-media${feature.links.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                    {feature.links.map((link, linkIndex) => (
                      <ButtonLink key={linkIndex} link={link} fallbackColor="cream" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {feature.heading && (
              <h5 className="feature-heading">{feature.heading}</h5>
            )}

            {feature.body && feature.body.length > 0 && (
              <div className="feature-body">
                <PortableText value={feature.body} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

