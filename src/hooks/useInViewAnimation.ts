'use client'

import { useEffect, useRef, useState } from 'react'

type AnimationVariant = 'opacity' | 'view'

interface UseInViewAnimationOptions {
  variant?: AnimationVariant
  stage?: 1 | 2
}

export function useInViewAnimation({
  variant = 'opacity',
  stage,
}: UseInViewAnimationOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const [inViewDetect, setInViewDetect] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const checkInView = () => {
      const rect = element.getBoundingClientRect()
      const viewportHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      )
      const isInView = rect.top < viewportHeight && rect.bottom > 0

      if (isInView) {
        setHasBeenInView(true)
        setInViewDetect(true)
      } else {
        setInViewDetect(false)
      }
    }

    checkInView()

    window.addEventListener('scroll', checkInView, { passive: true })
    window.addEventListener('resize', checkInView)
    window.addEventListener('orientationchange', checkInView)

    return () => {
      window.removeEventListener('scroll', checkInView)
      window.removeEventListener('resize', checkInView)
      window.removeEventListener('orientationchange', checkInView)
    }
  }, [])

  const baseClass = variant === 'view' ? 'out-of-view' : 'out-of-opacity'
  const stageClass = stage ? `stage-${stage}` : ''
  const inViewClasses = hasBeenInView
    ? `am-in-view${inViewDetect ? ' in-view-detect' : ''}`
    : ''

  const className = [baseClass, stageClass, inViewClasses].filter(Boolean).join(' ')

  return { ref, className, hasBeenInView }
}
