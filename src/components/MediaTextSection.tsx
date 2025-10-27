"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'
import SplideCarousel from './SplideCarousel'

interface mediaTextSectionProps {
  id?: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list'
  heading?: string
  body?: PortableTextBlock[]
  bulletList?: string[]
  buttons?: Link[]
  mediaType?: 'image' | 'video'
  images?: SanityImage[]
  video?: SanityVideo
  videoPlaceholder?: SanityImage
  mediaAlignment?: 'left' | 'right'
  roomReference?: {
    _id: string
    title: string
    roomType: 'cabin' | 'farmhouse'
    description?: PortableTextBlock[]
    slug: string
  }
}

export default function MediaTextSection({ 
  id,
  layout = 'media-with-text-h4-body', 
  heading,
  body, 
  bulletList,
  buttons, 
  mediaType = 'image',
  images, 
  video,
  videoPlaceholder,
  mediaAlignment = 'right',
  roomReference
}: mediaTextSectionProps) {
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)

  // Handle video loading overlay removal for first video
  useEffect(() => {
    if (mediaType === 'video' && videoRef1.current) {
      const video = videoRef1.current
      
      const handleVideoLoaded = () => {
        const mediaWrap = video.parentElement
        const loadingOverlay = mediaWrap?.querySelector('.loading-overlay')
        if (loadingOverlay && loadingOverlay instanceof HTMLElement) {
          loadingOverlay.classList.add('hidden')
        }
      }

      video.addEventListener('canplaythrough', handleVideoLoaded)
      
      if (video.readyState >= 3) {
        handleVideoLoaded()
      }

      return () => {
        video.removeEventListener('canplaythrough', handleVideoLoaded)
      }
    }
  }, [mediaType, video])

  // Handle video loading overlay removal for second video (in room-type layout)
  useEffect(() => {
    if (mediaType === 'video' && videoRef2.current) {
      const video = videoRef2.current
      
      const handleVideoLoaded = () => {
        const mediaWrap = video.parentElement
        const loadingOverlay = mediaWrap?.querySelector('.loading-overlay')
        if (loadingOverlay && loadingOverlay instanceof HTMLElement) {
          loadingOverlay.classList.add('hidden')
        }
      }

      video.addEventListener('canplaythrough', handleVideoLoaded)
      
      if (video.readyState >= 3) {
        handleVideoLoaded()
      }

      return () => {
        video.removeEventListener('canplaythrough', handleVideoLoaded)
      }
    }
  }, [mediaType, video])
  return (
    <>
      {(layout === 'media-with-text-h5' || layout === 'media-with-text-h4-body' || layout === 'media-with-text-h4-bullet-list') && (
        <section id={id} className={`media-text-section layout-${layout} align-${mediaAlignment} row-lg h-pad`}>
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

            {bulletList && bulletList.length > 0 && (
              <div className="media-text-bullet-list">
                {bulletList.map((item, index) => (
                  <div key={index} className="media-text-bullet-list-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                      <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                      <path d="M0.5 0.5L11.8181 15.5"/>
                    </svg>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
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
                  <SplideCarousel 
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
                  ref={videoRef1}
                  src={videoUrlFor(video)}
                  poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="loading-overlay" />
              </div>
            )}
          </div>
        </section>
      )}

      {layout === 'media-with-text-room-type' && roomReference && (
        <section id={id} className={`media-text-section room-type layout-${mediaAlignment} row-lg h-pad`}>
          <div className="col-3-12_lg col-1">
            {roomReference.roomType && (
              <div className="media-text-room-type">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
                  <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                  <path d="M0.5 0.5L11.8181 15.5"/>
                  <path d="M23.1365 0.5H11.8184V15.5H23.1365V0.5Z"/>
                  <path d="M11.8184 0.5L23.1365 15.5"/>
                </svg>

                <div>{roomReference.roomType}</div>
              </div>
            )}

            <h5 className="media-text-heading">{roomReference.title}</h5>
            
            {roomReference.description && (
              <div className="media-text-body">
                <PortableText value={roomReference.description} />
              </div>
            )}

            <div className="media-text-buttons">
              <a 
                href={`/rooms/${roomReference.slug}`}
                className="button button--cream"
              >
                View Room Details
              </a>

              {/* todo: add book room button */}
            </div>
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
                  <SplideCarousel 
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
                  ref={videoRef2}
                  src={videoUrlFor(video)}
                  poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="loading-overlay" />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
