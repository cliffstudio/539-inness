'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { DisableBodyScroll, EnableBodyScroll } from '@/utils/bodyScroll'
import { useBooking } from '@/contexts/BookingContext'
import { useBasket } from '@/contexts/BasketContext'

// Type for menu items from menuType schema
type MenuItem = {
  linkType?: 'internal' | 'external'
  label?: string
  href?: string
  pageLink?: {
    _id: string
    title?: string
    slug?: string
  }
}

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: MenuItem[]
}

interface HeaderProps {
  menu: Menu
}

export default function Header({ menu }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const menuOverlayRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  const { isOpen: isBookingOpen, openBooking, closeBooking } = useBooking()
  const { openBasket, getItemCount } = useBasket()
  const pathname = usePathname() || '/'

  const normalizePath = (path: string) => {
    if (!path || path === '/') return '/'
    return path.replace(/\/$/, '')
  }

  const activePathname = normalizePath(pathname)

  const getNavHref = (slug?: string) => {
    if (!slug) return '/'
    const trimmedSlug = slug.replace(/^\/+|\/+$/g, '')
    return trimmedSlug ? `/${trimmedSlug}` : '/'
  }

  const isCurrentPageLink = (href: string) => {
    const normalizedHref = normalizePath(href)

    if (normalizedHref === '/') {
      return activePathname === '/'
    }

    return (
      activePathname === normalizedHref ||
      activePathname.startsWith(`${normalizedHref}/`)
    )
  }

  const hasCurrentNav = menu.items.some((item) => {
    if (item.linkType === 'external') return false
    return isCurrentPageLink(getNavHref(item.pageLink?.slug))
  })

  const navClassName = `nav${hasCurrentNav ? ' nav-current-active' : ''}`

  const renderNavLinks = () =>
    menu.items.map((item, index) => {
      // Handle external links
      if (item.linkType === 'external') {
        const href = item.href || '#'
        const label = item.label || 'External Link'
        
        return (
          <a
            key={`external-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        )
      }

      // Handle internal links
      const href = getNavHref(item.pageLink?.slug)
      const isCurrent = isCurrentPageLink(href)
      const label = item.label || item.pageLink?.title || 'Untitled'

      return (
        <a
          key={`${item.pageLink?._id ?? href}-${index}`}
          className={isCurrent ? 'current-page' : undefined}
          href={href}
          aria-current={isCurrent ? 'page' : undefined}
        >
          {label}
        </a>
      )
    })

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      
      if (scrollPosition > 0) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    // Check initial scroll position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Set initial opacity for close and menu elements
  useEffect(() => {
    if (closeRef.current) {
      closeRef.current.style.opacity = '0'
    }
    if (menuRef.current) {
      menuRef.current.style.opacity = '1'
    }
  }, [])

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuVisible) {
      DisableBodyScroll()
    } else {
      EnableBodyScroll()
    }

    return () => {
      // Cleanup: re-enable scroll when component unmounts
      EnableBodyScroll()
    }
  }, [isMenuVisible])

  // Handle menu animations
  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Clear any existing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const menuOverlay = menuOverlayRef.current
    const innerWrap = innerWrapRef.current
    const closeElement = closeRef.current
    const menuElement = menuRef.current

    if (!menuOverlay || !innerWrap) return

    if (isMenuVisible) {
      // Opening animation
      // Step 1: Fade in menu-overlay and close element, fade out menu element over 250ms
      menuOverlay.style.pointerEvents = 'all'
      innerWrap.style.pointerEvents = 'none'
      
      const startTime = performance.now()
      const duration = 250 // 250ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        menuOverlay.style.opacity = progress.toString()
        if (closeElement) {
          closeElement.style.opacity = progress.toString()
        }
        if (menuElement) {
          menuElement.style.opacity = (1 - progress).toString()
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Ensure menu-overlay and close element are fully opaque, menu element is fully transparent
          menuOverlay.style.opacity = '1'
          if (closeElement) {
            closeElement.style.opacity = '1'
          }
          if (menuElement) {
            menuElement.style.opacity = '0'
          }
          // Step 2: After menu-overlay is fully visible, fade in inner-wrap immediately
          innerWrap.style.pointerEvents = 'all'
          const innerStartTime = performance.now()
          
          const animateInner = (currentTime: number) => {
            const elapsed = currentTime - innerStartTime
            const progress = Math.min(elapsed / duration, 1)
            
            innerWrap.style.opacity = progress.toString()

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateInner)
            } else {
              // Ensure inner-wrap is fully opaque
              innerWrap.style.opacity = '1'
              animationFrameRef.current = null
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(animateInner)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // Closing animation (opposite order)
      // Step 1: Fade out inner-wrap first
      innerWrap.style.pointerEvents = 'none'
      
      const startTime = performance.now()
      const duration = 250 // 250ms

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        innerWrap.style.opacity = (1 - progress).toString()

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Ensure inner-wrap is fully transparent
          innerWrap.style.opacity = '0'
          // Step 2: After inner-wrap is fully hidden, fade out menu-overlay and close element, fade in menu element
          menuOverlay.style.pointerEvents = 'none'
          const overlayStartTime = performance.now()
          
          const animateOverlay = (currentTime: number) => {
            const elapsed = currentTime - overlayStartTime
            const progress = Math.min(elapsed / duration, 1)
            
            menuOverlay.style.opacity = (1 - progress).toString()
            if (closeElement) {
              closeElement.style.opacity = (1 - progress).toString()
            }
            if (menuElement) {
              menuElement.style.opacity = progress.toString()
            }

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateOverlay)
            } else {
              // Ensure menu-overlay and close element are fully transparent, menu element is fully opaque
              menuOverlay.style.opacity = '0'
              if (closeElement) {
                closeElement.style.opacity = '0'
              }
              if (menuElement) {
                menuElement.style.opacity = '1'
              }
              animationFrameRef.current = null
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(animateOverlay)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isMenuVisible])

  const handleMenuClick = () => {
    // Only toggle menu on screens 820px and below
    if (window.innerWidth <= 768) {
      setIsMenuVisible(!isMenuVisible)
    }
  }

  return (
    <>
      {/* Desktop header */}
      <header className={`site-header site-header-desktop${scrolled ? ' scrolled' : ''}${isBookingOpen ? ' booking-overlay-open' : ''}`} suppressHydrationWarning>
        <div className="logo-wrap">
          <div className="logo-text relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="103" height="31" viewBox="0 0 103 31">
              <path d="M3.78572 2.72226V28.2768C3.78572 28.9866 4.14915 29.3261 4.48229 29.573C4.87601 29.8816 5.23944 30.1285 5.23944 30.1285V30.3446H0V30.1285C0 30.1285 0.363429 29.9125 0.757144 29.573C1.12057 29.2952 1.45372 28.9866 1.45372 28.2768V2.72226C1.45372 2.01242 1.09029 1.67292 0.757144 1.42602C0.363429 1.11739 0 0.870488 0 0.870488V0.654448H5.23944V0.870488C5.23944 0.870488 4.87601 1.08653 4.48229 1.42602C4.11886 1.70379 3.78572 2.01242 3.78572 2.72226Z"/>
              <path d="M46.4321 0.435207V0.650839C46.4321 0.650839 46.7962 0.897274 47.1907 1.29773C47.4941 1.60578 47.8885 1.88302 47.8885 3.05359V25.356L30.9274 2.09865C30.3509 1.23612 30.1689 0.835665 30.0779 0.435207H25.3142V0.650839C26.0727 0.958883 27.1954 1.51336 27.8932 2.4375C28.2573 2.89956 29.2586 4.19335 29.2586 5.54875L29.289 25.356L12.3278 2.09865C11.7514 1.23612 11.5693 0.835665 11.4783 0.435207H6.7146V0.650839C7.47315 0.958883 8.5958 1.51336 9.29366 2.4375C9.65776 2.89956 10.659 4.19335 10.659 5.54875V27.4507C10.659 28.6213 10.2646 28.8985 9.96118 29.2066C9.56674 29.607 9.20263 29.8535 9.20263 29.8535V30.0691H13.1471V29.8535C13.1471 29.8535 12.783 29.607 12.3885 29.2066C12.0851 28.8985 11.6907 28.6213 11.6907 27.4507V5.64116C17.2432 13.0958 30.0172 30.562 30.0172 30.562H30.3206L30.2903 5.64116C35.8428 13.0958 48.6168 30.562 48.6168 30.562H48.9202V3.05359C48.9202 1.88302 49.3146 1.60578 49.618 1.29773C50.0125 0.897274 50.3766 0.650839 50.3766 0.650839V0.435207H46.4321Z"/>
              <path d="M67.5718 30.3446H51.8535V30.1285C51.8535 30.1285 52.2128 29.9125 52.602 29.573C52.9613 29.2952 53.2906 28.9866 53.2906 28.2768V2.72226C53.2906 2.01242 52.9313 1.67292 52.602 1.42602C52.2128 1.11739 51.8535 0.870488 51.8535 0.870488V0.654448H66.6736V3.55556H66.4042C66.1048 3.09262 65.7754 2.78399 65.5359 2.50622C64.9072 1.8581 64.488 1.6112 63.53 1.6112H55.566V13.7712H63.6797C64.8174 13.7712 65.0868 13.37 65.3862 13.0613C65.7754 12.6601 66.0449 12.2898 66.0449 12.2898H66.2245V16.2402H66.0449C66.0449 16.2402 65.7754 15.8699 65.3862 15.4687C65.0868 15.16 64.8174 14.7588 63.6797 14.7588H55.566V29.4187H64.4282C65.2964 29.4187 65.7754 28.9249 66.3144 28.3694C66.5838 28.0916 66.973 27.5978 67.2724 27.1966H67.5718V30.3446Z"/>
              <path d="M69.4411 26.5934C71.4399 28.9354 73.8022 30.1988 76.3765 30.1988C80.98 30.1988 82.9788 27.0249 82.9788 23.7893C82.9788 19.1054 79.5262 17.5646 76.1342 15.839C72.5908 14.0209 69.0474 12.172 69.0474 7.48807C69.0474 3.14314 72.3788 0 76.8914 0C79.496 0 81.828 0.677932 83.4937 1.29423V4.00596H83.2211C81.1011 1.84891 79.4354 0.832008 76.8308 0.832008C72.7119 0.832008 71.0159 3.48211 71.0159 6.19384C71.0159 9.9841 73.7719 11.833 77.1034 13.4046C80.7074 15.1302 85.008 16.8867 85.008 22.341C85.008 27.7952 81.1011 31 76.3462 31C73.5599 31 70.7434 30.1372 69.1685 29.4592V26.5934H69.4411Z"/>
              <path d="M86.8781 26.5934C88.877 28.9354 91.2392 30.1988 93.8135 30.1988C98.417 30.1988 100.416 27.0248 100.416 23.7893C100.416 19.1054 96.9633 17.5646 93.5713 15.839C90.0278 14.0209 86.4844 12.172 86.4844 7.48807C86.4844 3.14314 89.8158 0 94.3284 0C96.933 0 99.265 0.677932 100.931 1.29423V4.00596H100.658C98.5381 1.84891 96.8724 0.832008 94.2678 0.832008C90.149 0.832008 88.4529 3.48211 88.4529 6.19384C88.4529 9.9841 91.209 11.833 94.5404 13.4046C98.1444 15.1302 102.445 16.8867 102.445 22.341C102.445 27.7952 98.5381 31 93.7832 31C90.997 31 88.1804 30.1372 86.6055 29.4592V26.5934H86.8781Z"/>
            </svg>

            <Link href="/" />
          </div>

          <div className="logo-icon relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="47" height="31" viewBox="0 0 47 31">
              <path d="M46.2734 31H0V0H46.2734V31ZM1 30H22.1328L1 1.99219V30ZM23.6367 30H44.7695L23.6367 1.99219V30ZM45.2734 29.0078V1H24.1406L45.2734 29.0078ZM22.6367 29.0078V1H1.50391L22.6367 29.0078Z"/>
            </svg>

            <Link href="/" />
          </div>
        </div>

        <div className="nav-wrap">
          <div className="left">
            {/* <div className="link-icon search-icon">
              <Link href="/search" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M7.9259 14.4243C11.8656 14.4243 15.0593 11.3653 15.0593 7.59173C15.0593 3.81821 11.8656 0.759171 7.9259 0.759171C3.98622 0.759171 0.79248 3.81821 0.79248 7.59173C0.79248 11.3653 3.98622 14.4243 7.9259 14.4243Z"/>
                  <path d="M12.6816 12.9059L17.4373 17.461"/>
                </svg>
              </Link>
            </div> */}

            <div className="link-icon cart-icon" onClick={openBasket} style={{ cursor: 'pointer', position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.349 0.652412H0.650879V17.3476H15.349V0.652412Z"/>
                <path d="M4.56958 4.57992V6.05436C4.56958 7.95288 6.10579 9.49257 8.00001 9.49257C9.89423 9.49257 11.4304 7.95288 11.4304 6.05436V4.57992"/>
              </svg>
              {getItemCount() > 0 && (
                <span className="cart-icon__badge">{getItemCount()}</span>
              )}
            </div>

            <div className="link-icon account-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.3334 18V14.6667C15.3334 12.3267 10.5467 10.6667 8.00008 10.6667C5.45341 10.6667 0.666748 12.3267 0.666748 14.6667V18"/>
                <path d="M8.00008 8.66666C9.92508 8.66666 11.3334 7.22666 11.3334 5.33333V4C11.3334 2.10666 9.92508 0.666664 8.00008 0.666664C6.06008 0.666664 4.66675 2.10666 4.66675 4V5.33333C4.66675 7.22666 6.06008 8.66666 8.00008 8.66666Z"/>
              </svg>
              <a href="https://members.inness.co/page/login" target="_blank" rel="noopener noreferrer"></a>
            </div>
          </div>

          {menu.items.length > 0 && (
            <div className={navClassName}>
              {renderNavLinks()}
            </div>
          )}

          <div className="right" onClick={() => isBookingOpen ? closeBooking() : openBooking('room')}>
            <div>{isBookingOpen ? 'Close' : 'Book'}</div>
          </div>
        </div>
      </header>

      {/* Tablet header */}
      <header className={`site-header site-header-tablet${scrolled ? ' scrolled' : ''}${isBookingOpen ? ' booking-overlay-open' : ''}`} suppressHydrationWarning>
        <div className="top-row">
          <div className="left">
            {/* <div className="link-icon search-icon">
              <Link href="/search" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M7.9259 14.4243C11.8656 14.4243 15.0593 11.3653 15.0593 7.59173C15.0593 3.81821 11.8656 0.759171 7.9259 0.759171C3.98622 0.759171 0.79248 3.81821 0.79248 7.59173C0.79248 11.3653 3.98622 14.4243 7.9259 14.4243Z"/>
                  <path d="M12.6816 12.9059L17.4373 17.461"/>
                </svg>
              </Link>
            </div> */}

            <div className="link-icon cart-icon" onClick={openBasket} style={{ cursor: 'pointer', position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.349 0.652412H0.650879V17.3476H15.349V0.652412Z"/>
                <path d="M4.56958 4.57992V6.05436C4.56958 7.95288 6.10579 9.49257 8.00001 9.49257C9.89423 9.49257 11.4304 7.95288 11.4304 6.05436V4.57992"/>
              </svg>
              {getItemCount() > 0 && (
                <span className="cart-icon__badge">{getItemCount()}</span>
              )}
            </div>

            <div className="link-icon account-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.3334 18V14.6667C15.3334 12.3267 10.5467 10.6667 8.00008 10.6667C5.45341 10.6667 0.666748 12.3267 0.666748 14.6667V18"/>
                <path d="M8.00008 8.66666C9.92508 8.66666 11.3334 7.22666 11.3334 5.33333V4C11.3334 2.10666 9.92508 0.666664 8.00008 0.666664C6.06008 0.666664 4.66675 2.10666 4.66675 4V5.33333C4.66675 7.22666 6.06008 8.66666 8.00008 8.66666Z"/>
              </svg>
              <a href="https://members.inness.co/page/login" target="_blank" rel="noopener noreferrer"></a>
            </div>
          </div>

          <div className="logo-wrap">
            <div className="logo-text relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="103" height="31" viewBox="0 0 103 31">
                <path d="M3.78572 2.72226V28.2768C3.78572 28.9866 4.14915 29.3261 4.48229 29.573C4.87601 29.8816 5.23944 30.1285 5.23944 30.1285V30.3446H0V30.1285C0 30.1285 0.363429 29.9125 0.757144 29.573C1.12057 29.2952 1.45372 28.9866 1.45372 28.2768V2.72226C1.45372 2.01242 1.09029 1.67292 0.757144 1.42602C0.363429 1.11739 0 0.870488 0 0.870488V0.654448H5.23944V0.870488C5.23944 0.870488 4.87601 1.08653 4.48229 1.42602C4.11886 1.70379 3.78572 2.01242 3.78572 2.72226Z"/>
                <path d="M46.4321 0.435207V0.650839C46.4321 0.650839 46.7962 0.897274 47.1907 1.29773C47.4941 1.60578 47.8885 1.88302 47.8885 3.05359V25.356L30.9274 2.09865C30.3509 1.23612 30.1689 0.835665 30.0779 0.435207H25.3142V0.650839C26.0727 0.958883 27.1954 1.51336 27.8932 2.4375C28.2573 2.89956 29.2586 4.19335 29.2586 5.54875L29.289 25.356L12.3278 2.09865C11.7514 1.23612 11.5693 0.835665 11.4783 0.435207H6.7146V0.650839C7.47315 0.958883 8.5958 1.51336 9.29366 2.4375C9.65776 2.89956 10.659 4.19335 10.659 5.54875V27.4507C10.659 28.6213 10.2646 28.8985 9.96118 29.2066C9.56674 29.607 9.20263 29.8535 9.20263 29.8535V30.0691H13.1471V29.8535C13.1471 29.8535 12.783 29.607 12.3885 29.2066C12.0851 28.8985 11.6907 28.6213 11.6907 27.4507V5.64116C17.2432 13.0958 30.0172 30.562 30.0172 30.562H30.3206L30.2903 5.64116C35.8428 13.0958 48.6168 30.562 48.6168 30.562H48.9202V3.05359C48.9202 1.88302 49.3146 1.60578 49.618 1.29773C50.0125 0.897274 50.3766 0.650839 50.3766 0.650839V0.435207H46.4321Z"/>
                <path d="M67.5718 30.3446H51.8535V30.1285C51.8535 30.1285 52.2128 29.9125 52.602 29.573C52.9613 29.2952 53.2906 28.9866 53.2906 28.2768V2.72226C53.2906 2.01242 52.9313 1.67292 52.602 1.42602C52.2128 1.11739 51.8535 0.870488 51.8535 0.870488V0.654448H66.6736V3.55556H66.4042C66.1048 3.09262 65.7754 2.78399 65.5359 2.50622C64.9072 1.8581 64.488 1.6112 63.53 1.6112H55.566V13.7712H63.6797C64.8174 13.7712 65.0868 13.37 65.3862 13.0613C65.7754 12.6601 66.0449 12.2898 66.0449 12.2898H66.2245V16.2402H66.0449C66.0449 16.2402 65.7754 15.8699 65.3862 15.4687C65.0868 15.16 64.8174 14.7588 63.6797 14.7588H55.566V29.4187H64.4282C65.2964 29.4187 65.7754 28.9249 66.3144 28.3694C66.5838 28.0916 66.973 27.5978 67.2724 27.1966H67.5718V30.3446Z"/>
                <path d="M69.4411 26.5934C71.4399 28.9354 73.8022 30.1988 76.3765 30.1988C80.98 30.1988 82.9788 27.0249 82.9788 23.7893C82.9788 19.1054 79.5262 17.5646 76.1342 15.839C72.5908 14.0209 69.0474 12.172 69.0474 7.48807C69.0474 3.14314 72.3788 0 76.8914 0C79.496 0 81.828 0.677932 83.4937 1.29423V4.00596H83.2211C81.1011 1.84891 79.4354 0.832008 76.8308 0.832008C72.7119 0.832008 71.0159 3.48211 71.0159 6.19384C71.0159 9.9841 73.7719 11.833 77.1034 13.4046C80.7074 15.1302 85.008 16.8867 85.008 22.341C85.008 27.7952 81.1011 31 76.3462 31C73.5599 31 70.7434 30.1372 69.1685 29.4592V26.5934H69.4411Z"/>
                <path d="M86.8781 26.5934C88.877 28.9354 91.2392 30.1988 93.8135 30.1988C98.417 30.1988 100.416 27.0248 100.416 23.7893C100.416 19.1054 96.9633 17.5646 93.5713 15.839C90.0278 14.0209 86.4844 12.172 86.4844 7.48807C86.4844 3.14314 89.8158 0 94.3284 0C96.933 0 99.265 0.677932 100.931 1.29423V4.00596H100.658C98.5381 1.84891 96.8724 0.832008 94.2678 0.832008C90.149 0.832008 88.4529 3.48211 88.4529 6.19384C88.4529 9.9841 91.209 11.833 94.5404 13.4046C98.1444 15.1302 102.445 16.8867 102.445 22.341C102.445 27.7952 98.5381 31 93.7832 31C90.997 31 88.1804 30.1372 86.6055 29.4592V26.5934H86.8781Z"/>
              </svg>

              <Link href="/" />
            </div>

            <div className="logo-icon relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="47" height="31" viewBox="0 0 47 31">
                <path d="M46.2734 31H0V0H46.2734V31ZM1 30H22.1328L1 1.99219V30ZM23.6367 30H44.7695L23.6367 1.99219V30ZM45.2734 29.0078V1H24.1406L45.2734 29.0078ZM22.6367 29.0078V1H1.50391L22.6367 29.0078Z"/>
              </svg>

              <Link href="/" />
            </div>
          </div>

          <div className="right" onClick={() => isBookingOpen ? closeBooking() : openBooking('room')}>
            <div>{isBookingOpen ? 'Close' : 'Book'}</div>
          </div>
        </div>

        <div className="nav-wrap">
          {menu.items.length > 0 && (
            <div className={navClassName}>
              {renderNavLinks()}
            </div>
          )}
        </div>
      </header>

      {/* Mobile header */}
      <header className={`site-header site-header-mobile${scrolled ? ' scrolled' : ''}${isMenuVisible ? ' menu-overlay-visible' : ''}${isBookingOpen ? ' booking-overlay-open' : ''}`} suppressHydrationWarning>
        <div className="left menu-opener" onClick={handleMenuClick}>
          <div ref={menuRef} className="menu">Menu</div>
          <div ref={closeRef} className="close">Close</div>
        </div>

        <div className="logo-wrap">
          <div className="logo-text relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="103" height="31" viewBox="0 0 103 31">
              <path d="M3.78572 2.72226V28.2768C3.78572 28.9866 4.14915 29.3261 4.48229 29.573C4.87601 29.8816 5.23944 30.1285 5.23944 30.1285V30.3446H0V30.1285C0 30.1285 0.363429 29.9125 0.757144 29.573C1.12057 29.2952 1.45372 28.9866 1.45372 28.2768V2.72226C1.45372 2.01242 1.09029 1.67292 0.757144 1.42602C0.363429 1.11739 0 0.870488 0 0.870488V0.654448H5.23944V0.870488C5.23944 0.870488 4.87601 1.08653 4.48229 1.42602C4.11886 1.70379 3.78572 2.01242 3.78572 2.72226Z"/>
              <path d="M46.4321 0.435207V0.650839C46.4321 0.650839 46.7962 0.897274 47.1907 1.29773C47.4941 1.60578 47.8885 1.88302 47.8885 3.05359V25.356L30.9274 2.09865C30.3509 1.23612 30.1689 0.835665 30.0779 0.435207H25.3142V0.650839C26.0727 0.958883 27.1954 1.51336 27.8932 2.4375C28.2573 2.89956 29.2586 4.19335 29.2586 5.54875L29.289 25.356L12.3278 2.09865C11.7514 1.23612 11.5693 0.835665 11.4783 0.435207H6.7146V0.650839C7.47315 0.958883 8.5958 1.51336 9.29366 2.4375C9.65776 2.89956 10.659 4.19335 10.659 5.54875V27.4507C10.659 28.6213 10.2646 28.8985 9.96118 29.2066C9.56674 29.607 9.20263 29.8535 9.20263 29.8535V30.0691H13.1471V29.8535C13.1471 29.8535 12.783 29.607 12.3885 29.2066C12.0851 28.8985 11.6907 28.6213 11.6907 27.4507V5.64116C17.2432 13.0958 30.0172 30.562 30.0172 30.562H30.3206L30.2903 5.64116C35.8428 13.0958 48.6168 30.562 48.6168 30.562H48.9202V3.05359C48.9202 1.88302 49.3146 1.60578 49.618 1.29773C50.0125 0.897274 50.3766 0.650839 50.3766 0.650839V0.435207H46.4321Z"/>
              <path d="M67.5718 30.3446H51.8535V30.1285C51.8535 30.1285 52.2128 29.9125 52.602 29.573C52.9613 29.2952 53.2906 28.9866 53.2906 28.2768V2.72226C53.2906 2.01242 52.9313 1.67292 52.602 1.42602C52.2128 1.11739 51.8535 0.870488 51.8535 0.870488V0.654448H66.6736V3.55556H66.4042C66.1048 3.09262 65.7754 2.78399 65.5359 2.50622C64.9072 1.8581 64.488 1.6112 63.53 1.6112H55.566V13.7712H63.6797C64.8174 13.7712 65.0868 13.37 65.3862 13.0613C65.7754 12.6601 66.0449 12.2898 66.0449 12.2898H66.2245V16.2402H66.0449C66.0449 16.2402 65.7754 15.8699 65.3862 15.4687C65.0868 15.16 64.8174 14.7588 63.6797 14.7588H55.566V29.4187H64.4282C65.2964 29.4187 65.7754 28.9249 66.3144 28.3694C66.5838 28.0916 66.973 27.5978 67.2724 27.1966H67.5718V30.3446Z"/>
              <path d="M69.4411 26.5934C71.4399 28.9354 73.8022 30.1988 76.3765 30.1988C80.98 30.1988 82.9788 27.0249 82.9788 23.7893C82.9788 19.1054 79.5262 17.5646 76.1342 15.839C72.5908 14.0209 69.0474 12.172 69.0474 7.48807C69.0474 3.14314 72.3788 0 76.8914 0C79.496 0 81.828 0.677932 83.4937 1.29423V4.00596H83.2211C81.1011 1.84891 79.4354 0.832008 76.8308 0.832008C72.7119 0.832008 71.0159 3.48211 71.0159 6.19384C71.0159 9.9841 73.7719 11.833 77.1034 13.4046C80.7074 15.1302 85.008 16.8867 85.008 22.341C85.008 27.7952 81.1011 31 76.3462 31C73.5599 31 70.7434 30.1372 69.1685 29.4592V26.5934H69.4411Z"/>
              <path d="M86.8781 26.5934C88.877 28.9354 91.2392 30.1988 93.8135 30.1988C98.417 30.1988 100.416 27.0248 100.416 23.7893C100.416 19.1054 96.9633 17.5646 93.5713 15.839C90.0278 14.0209 86.4844 12.172 86.4844 7.48807C86.4844 3.14314 89.8158 0 94.3284 0C96.933 0 99.265 0.677932 100.931 1.29423V4.00596H100.658C98.5381 1.84891 96.8724 0.832008 94.2678 0.832008C90.149 0.832008 88.4529 3.48211 88.4529 6.19384C88.4529 9.9841 91.209 11.833 94.5404 13.4046C98.1444 15.1302 102.445 16.8867 102.445 22.341C102.445 27.7952 98.5381 31 93.7832 31C90.997 31 88.1804 30.1372 86.6055 29.4592V26.5934H86.8781Z"/>
            </svg>

            <Link href="/" />
          </div>

          <div className="logo-icon relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="47" height="31" viewBox="0 0 47 31">
              <path d="M46.2734 31H0V0H46.2734V31ZM1 30H22.1328L1 1.99219V30ZM23.6367 30H44.7695L23.6367 1.99219V30ZM45.2734 29.0078V1H24.1406L45.2734 29.0078ZM22.6367 29.0078V1H1.50391L22.6367 29.0078Z"/>
            </svg>

            <Link href="/" />
          </div>
        </div>

        <div className="right" onClick={() => (isBookingOpen ? closeBooking() : openBooking('room'))}>
          <div>{isBookingOpen ? 'Close' : 'Book'}</div>
        </div>
      </header>

      <div ref={menuOverlayRef} className="menu-overlay">
        <div ref={innerWrapRef} className="inner-wrap">
          {menu.items.length > 0 && (
            <div className={navClassName}>
              {renderNavLinks()}
            </div>
          )}

          <div className="icon-wrapper">
            {/* <div className="link-icon search-icon">
              <Link href="/search" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M7.9259 14.4243C11.8656 14.4243 15.0593 11.3653 15.0593 7.59173C15.0593 3.81821 11.8656 0.759171 7.9259 0.759171C3.98622 0.759171 0.79248 3.81821 0.79248 7.59173C0.79248 11.3653 3.98622 14.4243 7.9259 14.4243Z"/>
                  <path d="M12.6816 12.9059L17.4373 17.461"/>
                </svg>
              </Link>
            </div> */}

            <div className="link-icon cart-icon" onClick={openBasket} style={{ cursor: 'pointer', position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.349 0.652412H0.650879V17.3476H15.349V0.652412Z"/>
                <path d="M4.56958 4.57992V6.05436C4.56958 7.95288 6.10579 9.49257 8.00001 9.49257C9.89423 9.49257 11.4304 7.95288 11.4304 6.05436V4.57992"/>
              </svg>
              {getItemCount() > 0 && (
                <span className="cart-icon__badge">{getItemCount()}</span>
              )}
            </div>

            <div className="link-icon account-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                <path d="M15.3334 18V14.6667C15.3334 12.3267 10.5467 10.6667 8.00008 10.6667C5.45341 10.6667 0.666748 12.3267 0.666748 14.6667V18"/>
                <path d="M8.00008 8.66666C9.92508 8.66666 11.3334 7.22666 11.3334 5.33333V4C11.3334 2.10666 9.92508 0.666664 8.00008 0.666664C6.06008 0.666664 4.66675 2.10666 4.66675 4V5.33333C4.66675 7.22666 6.06008 8.66666 8.00008 8.66666Z"/>
              </svg>
              <a href="https://members.inness.co/page/login" target="_blank" rel="noopener noreferrer"></a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
