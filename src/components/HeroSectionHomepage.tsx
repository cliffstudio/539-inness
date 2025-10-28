/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { SanityVideo } from '../types/sanity'

interface HomepageHeroProps {
  heading?: string
  mediaType?: 'image' | 'video'
  image?: SanityImageSource
  video?: SanityVideo
  videoPlaceholder?: SanityImageSource
}

export default function HeroSectionHomepage({ 
  heading, 
  mediaType = 'image',
  image, 
  video, 
  videoPlaceholder 
}: HomepageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      const video = videoRef.current
      
      const handleVideoLoaded = () => {
        const loadingOverlay = video.nextElementSibling
        if (loadingOverlay && loadingOverlay instanceof HTMLElement) {
          loadingOverlay.classList.add('hidden')
        }
      }

      // Listen for when the video can play through
      video.addEventListener('canplaythrough', handleVideoLoaded)
      
      // If already loaded, remove overlay immediately
      if (video.readyState >= 3) {
        handleVideoLoaded()
      }

      return () => {
        video.removeEventListener('canplaythrough', handleVideoLoaded)
      }
    }
  }, [mediaType])

  // Don't render if no content
  if (!heading && !image && !video) {
    return null
  }

  return (
    <section className="hero-section layout-1 relative">
      {mediaType === 'video' && video && (
        <div className="fill-space-video-wrap media-wrap">
          <video
            ref={videoRef}
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
      
      {mediaType === 'image' && image && (
        <div className="fill-space-image-wrap media-wrap">
          <img 
            data-src={urlFor(image).url()} 
            alt="" 
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />
        </div>
      )}

      {heading && (
        <div className="hero-content h-pad">
          <h3>{heading}</h3>
        </div>
      )}

      <div className="hero-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)" stroke="#FFF9ED"/>
          <path d="M24 15.5L17.5 22L11 15.5" stroke="#FFF9ED"/>
        </svg>
      </div>
    </section>
  )
}
