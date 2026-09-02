'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  getPreferredVideoResolution,
  videoPosterUrlFor,
  videoUrlFor,
} from '@/sanity/utils/videoUrlBuilder'
import type { SanityVideo } from '@/types/sanity'

type LoadStrategy = 'idle' | 'visible'

interface BackgroundVideoProps {
  video: SanityVideo
  loadStrategy?: LoadStrategy
  showLoadingOverlay?: boolean
}

const BackgroundVideo = forwardRef<HTMLVideoElement, BackgroundVideoProps>(
  function BackgroundVideo({ video, loadStrategy = 'idle', showLoadingOverlay = true }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement)
    const [src, setSrc] = useState<string | undefined>(undefined)
    const poster = videoPosterUrlFor(video)

    useEffect(() => {
      const url = videoUrlFor(video, { resolution: getPreferredVideoResolution() })

      if (loadStrategy === 'idle') {
        const load = () => setSrc(url)
        if (typeof window.requestIdleCallback === 'function') {
          const id = window.requestIdleCallback(load, { timeout: 2000 })
          return () => window.cancelIdleCallback(id)
        }
        const id = window.setTimeout(load, 100)
        return () => window.clearTimeout(id)
      }

      const el = videoRef.current
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setSrc(url)
            observer.disconnect()
          }
        },
        { rootMargin: '100px' }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }, [video, loadStrategy])

    useEffect(() => {
      const el = videoRef.current
      if (!src || !el) return

      void el.play().catch(() => {})

      const hideOverlay = () => {
        const overlay = el.nextElementSibling
        if (overlay instanceof HTMLElement && overlay.classList.contains('loading-overlay')) {
          overlay.classList.add('hidden')
        }
      }

      el.addEventListener('canplaythrough', hideOverlay)
      if (el.readyState >= 3) hideOverlay()
      return () => el.removeEventListener('canplaythrough', hideOverlay)
    }, [src])

    return (
      <>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
        {showLoadingOverlay && <div className="loading-overlay" />}
      </>
    )
  }
)

export default BackgroundVideo
