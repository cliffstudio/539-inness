/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { PortableTextBlock } from '@portabletext/react'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import FlexibleContent from './FlexibleContent'
import { urlFor } from '../sanity/utils/imageUrlBuilder'

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
  image?: SanityImageSource
  activityType?: string
  contentBlocks?: ContentBlock[]
}

const ActivityPage: React.FC<ActivityPageProps> = ({
  title,
  image,
  contentBlocks,
}) => {
  return (
    <>
      <section className="hero-section layout-2 h-pad">
        {image && (
          <div className="hero-image relative">
            <div className="fill-space-image-wrap media-wrap">
              <img
                data-src={urlFor(image).url()}
                alt={title || ''}
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          </div>
        )}

        <div className="hero-content h-pad">
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

