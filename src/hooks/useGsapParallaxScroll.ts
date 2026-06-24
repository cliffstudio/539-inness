'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const DESKTOP_MIN_WIDTH = 769

interface UseGsapParallaxScrollOptions {
  enabled?: boolean
}

export function useGsapParallaxScroll(
  elementRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  { enabled = true }: UseGsapParallaxScrollOptions = {}
) {
  useEffect(() => {
    if (!enabled || window.innerWidth < DESKTOP_MIN_WIDTH) return

    const element = elementRef.current
    const trigger = triggerRef.current
    if (!element || !trigger) return

    gsap.registerPlugin(ScrollTrigger)

    const tween = gsap.to(element, {
      startAt: {
        scale: 1,
        x: 0,
        y: 0,
      },
      scale: 1.05,
      x: 20,
      y: -20,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [elementRef, triggerRef, enabled])
}
