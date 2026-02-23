/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import type { SanityImageSource } from '@sanity/image-url'
import { SanityVideo } from '../types/sanity'

interface HomepageHeroProps {
  homepageHeading?: string
  homepageMediaType?: 'image' | 'video'
  homepageImage?: SanityImageSource
  homepageVideo?: SanityVideo
}

export default function HeroSectionHomepage({ 
  homepageHeading, 
  homepageMediaType = 'image',
  homepageImage, 
  homepageVideo
}: HomepageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const overflowRef = useRef<{ body: string; html: string } | null>(null)

  useLayoutEffect(() => {
    if (homepageMediaType === 'video' && videoRef.current) {
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
  }, [homepageMediaType])

  useLayoutEffect(() => {
    const body = document.body
    const html = document.documentElement
    const siteHeaders = document.querySelectorAll<HTMLElement>('.site-header')
    
    // Immediately hide header and disable scroll before paint
    overflowRef.current = {
      body: body.style.overflow,
      html: html.style.overflow
    }
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    body.classList.add('page-home-loader-active')
    
    // Ensure header classes are applied (may already be from script, but ensure they're there)
    siteHeaders.forEach(header => {
      header.classList.add('is-translated-up')
    })
  }, [])

  useEffect(() => {
    const heroSection = heroSectionRef.current
    if (!heroSection) return

    const body = document.body
    const html = document.documentElement
    const gradientOverlay = heroSection.querySelector<HTMLElement>('.gradient-overlay')
    const heroContent = heroSection.querySelector<HTMLElement>('.hero-content')
    const heroArrow = heroSection.querySelector<HTMLElement>('.hero-arrow')
    const siteHeaders = document.querySelectorAll<HTMLElement>('.site-header')

    if (!gradientOverlay || !heroArrow) {
      return
    }

    // Start with elements hidden/translated
    if (heroContent) {
      heroContent.classList.remove('is-visible')
    }
    heroArrow.classList.remove('is-visible')
    gradientOverlay.classList.remove('is-visible')

    const timers: number[] = []
    const setTimer = (callback: () => void, delay: number) => {
      const id = window.setTimeout(callback, delay)
      timers.push(id)
    }

    // Initial delay before starting animations
    const initialDelay = 500
    const stepDelay = 500

    // Step 1: Hero content fades in
    const heroContentStart = initialDelay
    setTimer(() => {
      if (heroContent) {
        heroContent.classList.add('is-visible')
      }
    }, heroContentStart)

    // Step 2: Hero arrow fades in (500ms after hero content)
    const heroArrowStart = heroContentStart + stepDelay
    setTimer(() => {
      heroArrow.classList.add('is-visible')
    }, heroArrowStart)

    // Step 3: Site header translates down and gradient overlay fades in together (500ms after arrow)
    const headerGradientStart = heroArrowStart + stepDelay
    setTimer(() => {
      siteHeaders.forEach(header => {
        header.classList.remove('is-translated-up')
      })
      gradientOverlay.classList.add('is-visible')
      body.classList.remove('page-home-loader-active')
    }, headerGradientStart)

    // Re-enable scroll after animations complete
    const reenableScrollStart = headerGradientStart + 400 // Wait for transition to complete
    setTimer(() => {
      if (overflowRef.current) {
        body.style.overflow = overflowRef.current.body
        html.style.overflow = overflowRef.current.html
      }
    }, reenableScrollStart)

    return () => {
      timers.forEach(window.clearTimeout)
      if (overflowRef.current) {
        body.style.overflow = overflowRef.current.body
        html.style.overflow = overflowRef.current.html
      }
      body.classList.remove('page-home-loader-active')
      const headers = document.querySelectorAll<HTMLElement>('.site-header')
      headers.forEach(header => {
        header.classList.remove('is-translated-up')
      })
    }
  }, [])

  const handleArrowClick = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  // Don't render if no content
  if (!homepageHeading && !homepageImage && !homepageVideo) {
    return null
  }

  return (
    <section ref={heroSectionRef} className="hero-section layout-1 relative">
      {homepageMediaType === 'video' && homepageVideo && (
        <div className="fill-space-video-wrap media-wrap">
          <video
            ref={videoRef}
            src={videoUrlFor(homepageVideo)}
            poster={
              typeof homepageVideo === 'object' &&
              homepageVideo !== null &&
              'thumbnailUrl' in homepageVideo
                ? homepageVideo.thumbnailUrl
                : undefined
            }
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="loading-overlay" />
        </div>
      )}
      
      {homepageMediaType === 'image' && homepageImage && (
        <div className="fill-space-image-wrap media-wrap">
          <img 
            data-src={urlFor(homepageImage).url()} 
            alt="" 
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />
        </div>
      )}

      <div className="gradient-overlay"></div>

      {homepageHeading && (
        <div className="hero-content h-pad">
          <h3>{homepageHeading}</h3>
        </div>
      )}

      <div className="hero-arrow" onClick={handleArrowClick} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17.5" transform="matrix(0 -1 -1 0 36 36)" stroke="#FFF9ED"/>
          <path d="M24 15.5L17.5 22L11 15.5" stroke="#FFF9ED"/>
        </svg>
      </div>
    </section>
  )
}
