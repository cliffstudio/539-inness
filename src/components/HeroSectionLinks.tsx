/* eslint-disable @next/next/no-img-element */
'use client'
import { useRef, useLayoutEffect } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import SplideCarousel from './SplideCarousel'

interface LinksHeroProps {
  id?: string
  heading?: string
  body?: PortableTextBlock[]
  mediaType?: 'image' | 'video'
  images?: SanityImage[]
  video?: SanityVideo
}

export default function HeroSectionLinks({ id, heading, body, mediaType = 'image', images, video }: LinksHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return
    const el = videoRef.current
    const hideOverlay = () => {
      const overlay = el.nextElementSibling
      if (overlay && overlay instanceof HTMLElement) overlay.classList.add('hidden')
    }
    el.addEventListener('canplaythrough', hideOverlay)
    if (el.readyState >= 3) hideOverlay()
    return () => el.removeEventListener('canplaythrough', hideOverlay)
  }, [mediaType])

  return (
    <section id={id} className="hero-section layout-2 h-pad">
      {mediaType === 'video' && video && (
        <div className="hero-image relative out-of-opacity">
          <div className="fill-space-video-wrap media-wrap">
            <video
              ref={videoRef}
              src={videoUrlFor(video)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="loading-overlay" />
          </div>
        </div>
      )}
      
      {mediaType === 'image' && images && images.length > 0 && (
        images.length === 1 ? (
          <div className="hero-image relative out-of-opacity">
            <div className="fill-space-image-wrap media-wrap">
              <img 
                data-src={urlFor(images[0]).url()} 
                alt="" 
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          </div>
        ) : (
          <div className="hero-image relative out-of-opacity">
            <SplideCarousel 
              images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
              onPrevious={() => {}}
              onNext={() => {}}
            />
          </div>
        )
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
      </div>
    </section>
  )
}

