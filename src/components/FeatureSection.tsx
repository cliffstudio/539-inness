"use client"

/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import type { SanityImageSource } from '@sanity/image-url'
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
  layout?: 'single-feature' | '2-features' | '4-features'
  subHeading?: string
  heading?: string
  feature1?: Feature
  feature2?: Feature
  feature3?: Feature
  feature4?: Feature
}

export default function FeatureSection({ 
  id,
  layout = 'single-feature',
  subHeading,
  heading,
  feature1,
  feature2,
  feature3,
  feature4,
}: FeatureSectionProps) {
  // Collect features based on layout
  const features: Feature[] = []
  if (feature1) features.push(feature1)
  if (layout === '2-features' || layout === '4-features') {
    if (feature2) features.push(feature2)
  }
  if (layout === '4-features') {
    if (feature3) features.push(feature3)
    if (feature4) features.push(feature4)
  }

  if (!features || features.length === 0) {
    return null
  }

  const getGridColumnClass = () => {
    if (layout === 'single-feature') {
      return 'col-12-12_lg'
    } else if (layout === '2-features') {
      return 'col-6-12_lg'
    } else {
      // For 4-features layout, handle any number of features
      // Use responsive grid that fits the number of items
      if (features.length === 3) {
        return 'col-4-12_lg'
      }
      return 'col-3-12_lg'
    }
  }

  return (
    <section id={id} className={`feature-section layout-${layout} h-pad`}>
      <div className="out-of-opacity">
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
            <div key={index} className={`feature-item ${getGridColumnClass()}`}>
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
      </div>
    </section>
  )
}

