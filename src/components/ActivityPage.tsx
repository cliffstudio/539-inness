/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { PortableTextBlock } from '@portabletext/react'
import FlexibleContent from './FlexibleContent'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import SplideCarousel from './SplideCarousel'

type TimeRange = {
  startTime?: string
  endTime?: string
}

type ContentBlock = {
  _type: string
  [key: string]: unknown
}

interface ActivityPageProps {
  title?: string
  slug?: { current?: string }
  date?: string
  timeRange?: TimeRange
  description?: PortableTextBlock[]
  bookingHref?: string
  images?: SanityImage[]
  activityType?: string
  contentBlocks?: ContentBlock[]
}

const ActivityPage: React.FC<ActivityPageProps> = ({
  title,
  images,
  contentBlocks,
}) => {
  return (
    <>
      <section className="hero-section layout-2 h-pad">
        {images && images.length > 0 && (
          images.length === 1 ? (
            <div className="hero-image relative out-of-opacity">
              <div className="fill-space-image-wrap media-wrap">
                <img
                  data-src={urlFor(images[0]).url()}
                  alt={title || ''}
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            </div>
          ) : (
            <div className="hero-image relative out-of-opacity">
              <SplideCarousel
                images={images.map(image => ({ url: urlFor(image).url(), alt: title || '' }))}
                onPrevious={() => {}}
                onNext={() => {}}
              />
            </div>
          )
        )}

        <div className="hero-content out-of-opacity">
          <div className="row-1">
            {title && <h3>{title}</h3>}

            <div>Members + Hotel Guests Only</div>
          </div>
        </div>
      </section>

      {contentBlocks && contentBlocks.length > 0 && (
        <FlexibleContent contentBlocks={contentBlocks} />
      )}
    </>
  )
}

export default ActivityPage

