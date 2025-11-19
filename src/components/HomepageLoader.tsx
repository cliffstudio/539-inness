'use client'

import { useEffect, useRef, useState } from 'react'

export default function HomepageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const loader = loaderRef.current
    const logo = logoRef.current

    if (!loader || !logo) return

    // Wait for DOM elements to be available
    const waitForElements = () => {
      return new Promise<void>((resolve) => {
        const checkElements = () => {
          heroContentRef.current = document.querySelector('.hero-content')
          headerRef.current = document.querySelector('.site-header-desktop, .site-header-tablet, .site-header-mobile')
          
          if (heroContentRef.current || headerRef.current) {
            // Set initial opacity: 0 for header and hero-content
            if (heroContentRef.current) {
              heroContentRef.current.style.opacity = '0'
            }
            if (headerRef.current) {
              headerRef.current.style.opacity = '0'
            }
            resolve()
          } else {
            // Retry after a short delay
            setTimeout(checkElements, 50)
          }
        }
        checkElements()
      })
    }

    // Animation timeline
    const timeline = async () => {
      // Wait for elements to be available
      await waitForElements()
      // Step 1: Orange background is already visible (initial state)
      
      // Step 2: Logo fades in (after 200ms, fade in over 500ms)
      await new Promise(resolve => setTimeout(resolve, 200))
      const logoFadeInStart = performance.now()
      const logoFadeInDuration = 500

      await new Promise<void>((resolve) => {
        const animateLogoIn = (currentTime: number) => {
          const elapsed = currentTime - logoFadeInStart
          const progress = Math.min(elapsed / logoFadeInDuration, 1)
          logo.style.opacity = progress.toString()

          if (progress < 1) {
            requestAnimationFrame(animateLogoIn)
          } else {
            resolve()
          }
        }
        requestAnimationFrame(animateLogoIn)
      })

      // Step 3: Logo fades out (after logo is visible for 1500ms, fade out over 500ms)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const logoFadeOutStart = performance.now()
      const logoFadeOutDuration = 500

      await new Promise<void>((resolve) => {
        const animateLogoOut = (currentTime: number) => {
          const elapsed = currentTime - logoFadeOutStart
          const progress = Math.min(elapsed / logoFadeOutDuration, 1)
          logo.style.opacity = (1 - progress).toString()

          if (progress < 1) {
            requestAnimationFrame(animateLogoOut)
          } else {
            resolve()
          }
        }
        requestAnimationFrame(animateLogoOut)
      })

      // Step 4: Hero content fades in (after logo fade out completes, 300ms delay, fade in over 500ms)
      await new Promise(resolve => setTimeout(resolve, 300))
      if (heroContentRef.current) {
        const heroStartTime = performance.now()
        const heroDuration = 500

        const animateHero = (currentTime: number) => {
          const elapsed = currentTime - heroStartTime
          const progress = Math.min(elapsed / heroDuration, 1)
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = progress.toString()
          }

          if (progress < 1) {
            requestAnimationFrame(animateHero)
          }
        }
        requestAnimationFrame(animateHero)
      }

      // Step 5: Orange background fades out to show video (after hero fade in, 400ms delay, fade out over 800ms)
      await new Promise(resolve => setTimeout(resolve, 400))
      const loaderStartTime = performance.now()
      const loaderDuration = 800

      const animateLoader = (currentTime: number) => {
        const elapsed = currentTime - loaderStartTime
        const progress = Math.min(elapsed / loaderDuration, 1)
        loader.style.opacity = (1 - progress).toString()

        if (progress < 1) {
          requestAnimationFrame(animateLoader)
        } else {
          loader.style.pointerEvents = 'none'
          setIsLoading(false)
        }
      }
      requestAnimationFrame(animateLoader)

      // Step 6: Header fades in (after loader starts fading, 300ms delay, fade in over 500ms)
      await new Promise(resolve => setTimeout(resolve, 300))
      if (headerRef.current) {
        const headerStartTime = performance.now()
        const headerDuration = 500

        const animateHeader = (currentTime: number) => {
          const elapsed = currentTime - headerStartTime
          const progress = Math.min(elapsed / headerDuration, 1)
          if (headerRef.current) {
            headerRef.current.style.opacity = progress.toString()
          }

          if (progress < 1) {
            requestAnimationFrame(animateHeader)
          }
        }
        requestAnimationFrame(animateHeader)
      }
    }

    timeline()

    return () => {
      // Cleanup: ensure elements are visible if component unmounts
      if (heroContentRef.current) {
        heroContentRef.current.style.opacity = '1'
      }
      if (headerRef.current) {
        headerRef.current.style.opacity = '1'
      }
    }
  }, [])

  if (!isLoading && loaderRef.current) {
    return null
  }

  return (
    <div ref={loaderRef} className="homepage-loader">
      <div ref={logoRef} className="homepage-loader-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="103" height="31" viewBox="0 0 103 31">
          <path d="M3.78572 2.72226V28.2768C3.78572 28.9866 4.14915 29.3261 4.48229 29.573C4.87601 29.8816 5.23944 30.1285 5.23944 30.1285V30.3446H0V30.1285C0 30.1285 0.363429 29.9125 0.757144 29.573C1.12057 29.2952 1.45372 28.9866 1.45372 28.2768V2.72226C1.45372 2.01242 1.09029 1.67292 0.757144 1.42602C0.363429 1.11739 0 0.870488 0 0.870488V0.654448H5.23944V0.870488C5.23944 0.870488 4.87601 1.08653 4.48229 1.42602C4.11886 1.70379 3.78572 2.01242 3.78572 2.72226Z"/>
          <path d="M46.4321 0.435207V0.650839C46.4321 0.650839 46.7962 0.897274 47.1907 1.29773C47.4941 1.60578 47.8885 1.88302 47.8885 3.05359V25.356L30.9274 2.09865C30.3509 1.23612 30.1689 0.835665 30.0779 0.435207H25.3142V0.650839C26.0727 0.958883 27.1954 1.51336 27.8932 2.4375C28.2573 2.89956 29.2586 4.19335 29.2586 5.54875L29.289 25.356L12.3278 2.09865C11.7514 1.23612 11.5693 0.835665 11.4783 0.435207H6.7146V0.650839C7.47315 0.958883 8.5958 1.51336 9.29366 2.4375C9.65776 2.89956 10.659 4.19335 10.659 5.54875V27.4507C10.659 28.6213 10.2646 28.8985 9.96118 29.2066C9.56674 29.607 9.20263 29.8535 9.20263 29.8535V30.0691H13.1471V29.8535C13.1471 29.8535 12.783 29.607 12.3885 29.2066C12.0851 28.8985 11.6907 28.6213 11.6907 27.4507V5.64116C17.2432 13.0958 30.0172 30.562 30.0172 30.562H30.3206L30.2903 5.64116C35.8428 13.0958 48.6168 30.562 48.6168 30.562H48.9202V3.05359C48.9202 1.88302 49.3146 1.60578 49.618 1.29773C50.0125 0.897274 50.3766 0.650839 50.3766 0.650839V0.435207H46.4321Z"/>
          <path d="M67.5718 30.3446H51.8535V30.1285C51.8535 30.1285 52.2128 29.9125 52.602 29.573C52.9613 29.2952 53.2906 28.9866 53.2906 28.2768V2.72226C53.2906 2.01242 52.9313 1.67292 52.602 1.42602C52.2128 1.11739 51.8535 0.870488 51.8535 0.870488V0.654448H66.6736V3.55556H66.4042C66.1048 3.09262 65.7754 2.78399 65.5359 2.50622C64.9072 1.8581 64.488 1.6112 63.53 1.6112H55.566V13.7712H63.6797C64.8174 13.7712 65.0868 13.37 65.3862 13.0613C65.7754 12.6601 66.0449 12.2898 66.0449 12.2898H66.2245V16.2402H66.0449C66.0449 16.2402 65.7754 15.8699 65.3862 15.4687C65.0868 15.16 64.8174 14.7588 63.6797 14.7588H55.566V29.4187H64.4282C65.2964 29.4187 65.7754 28.9249 66.3144 28.3694C66.5838 28.0916 66.973 27.5978 67.2724 27.1966H67.5718V30.3446Z"/>
          <path d="M69.4411 26.5934C71.4399 28.9354 73.8022 30.1988 76.3765 30.1988C80.98 30.1988 82.9788 27.0249 82.9788 23.7893C82.9788 19.1054 79.5262 17.5646 76.1342 15.839C72.5908 14.0209 69.0474 12.172 69.0474 7.48807C69.0474 3.14314 72.3788 0 76.8914 0C79.496 0 81.828 0.677932 83.4937 1.29423V4.00596H83.2211C81.1011 1.84891 79.4354 0.832008 76.8308 0.832008C72.7119 0.832008 71.0159 3.48211 71.0159 6.19384C71.0159 9.9841 73.7719 11.833 77.1034 13.4046C80.7074 15.1302 85.008 16.8867 85.008 22.341C85.008 27.7952 81.1011 31 76.3462 31C73.5599 31 70.7434 30.1372 69.1685 29.4592V26.5934H69.4411Z"/>
          <path d="M86.8781 26.5934C88.877 28.9354 91.2392 30.1988 93.8135 30.1988C98.417 30.1988 100.416 27.0248 100.416 23.7893C100.416 19.1054 96.9633 17.5646 93.5713 15.839C90.0278 14.0209 86.4844 12.172 86.4844 7.48807C86.4844 3.14314 89.8158 0 94.3284 0C96.933 0 99.265 0.677932 100.931 1.29423V4.00596H100.658C98.5381 1.84891 96.8724 0.832008 94.2678 0.832008C90.149 0.832008 88.4529 3.48211 88.4529 6.19384C88.4529 9.9841 91.209 11.833 94.5404 13.4046C98.1444 15.1302 102.445 16.8867 102.445 22.341C102.445 27.7952 98.5381 31 93.7832 31C90.997 31 88.1804 30.1372 86.6055 29.4592V26.5934H86.8781Z"/>
        </svg>
      </div>
    </div>
  )
}

