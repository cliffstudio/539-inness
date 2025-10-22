"use client"

/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'
import FlickityCarousel from './FlickityCarousel'

interface mediaTextSectionProps {
  id?: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body'
  heading?: string
  body?: PortableTextBlock[]
  buttons?: Link[]
  mediaType?: 'image' | 'video'
  images?: SanityImage[]
  video?: SanityVideo
  videoPlaceholder?: SanityImage
  mediaAlignment?: 'left' | 'right'
}

export default function MediaTextSection({ 
  id,
  layout = 'media-with-text-h4-body', 
  heading,
  body, 
  buttons, 
  mediaType = 'image',
  images, 
  video,
  videoPlaceholder,
  mediaAlignment = 'right' 
}: mediaTextSectionProps) {
  return (
    <section id={id} className={`media-text-section layout-${mediaAlignment} row-lg h-pad`}>

      <div className="col-3-12_lg col-1">
        {heading && layout !== 'media-with-text-h5' && (
          <h4 className="media-text-heading">{heading}</h4>
        )}
        
        {body && body.length > 0 && (
          <>
            {layout === 'media-with-text-h4-body' && (
              <div className="media-text-body">
                <PortableText value={body} />
              </div>
            )}

            {layout === 'media-with-text-h5' && (
              <h5 className="media-text-body">
                <PortableText value={body} />
              </h5>
            )}
          </>
        )}

        {buttons && buttons.length > 0 && (
          <div className={`media-text-buttons${buttons.length > 1 ? ' multiple-buttons' : ''}`}>
            {buttons.map((button, index) => {
              const linkInfo = getLinkInfo(button)
              if (!linkInfo.text || !linkInfo.href) return null
              return (
                <a 
                  key={index}
                  href={linkInfo.href}
                  className="button button--cream"
                  {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {linkInfo.text}
                </a>
              )
            })}
          </div>
        )}
      </div>

      <div className="col-3-12_lg dummy-col col-2"></div>

      <div className="col-6-12_lg col-3">
        {mediaType === 'image' && images && images.length > 0 && (
          <div className="media-wrap">
            {images.length === 1 ? (
              <img 
                data-src={urlFor(images[0]).url()} 
                alt="" 
                className="lazy full-bleed-image"
              />
            ) : (
              <FlickityCarousel 
                images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                onPrevious={() => {}}
                onNext={() => {}}
              />
            )}
          </div>
        )}
        
        {mediaType === 'video' && video && (
          <div className="media-wrap">
            <video
              src={videoUrlFor(video)}
              poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        )}
      </div>
    </section>
  )
}
