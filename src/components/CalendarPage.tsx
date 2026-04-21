'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { SanityImage } from '../types/sanity'
import ButtonLink from './ButtonLink'

const EVENT_TIME_ZONE = 'America/New_York'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface Activity {
  _id: string
  title?: string
  /** Legacy: date + timeRange */
  date?: string
  timeRange?: {
    startTime?: string
    endTime?: string
  }
  /** Calendar: ISO datetime */
  startsAt?: string
  endsAt?: string
  locationAddress?: string
  images?: SanityImage[]
  description?: string | PortableTextBlock[]
  // Peoplevine thumbnail URL
  thumbnail?: string
  bookingHref?: string
  slug?: string
  activityType?: string
  eventCategories?: string[]
  contentBlocks?: ContentBlock[]
}

interface ActivitySectionProps {
  id?: string
  heading?: string
  activities?: Activity[]
  disableCarousel?: boolean
  topSlot?: ReactNode
}

export default function CalendarPage({
  id,
  heading,
  activities: activitiesProp,
  disableCarousel = false,
  topSlot,
}: ActivitySectionProps) {
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isAtEndOfActivities, setIsAtEndOfActivities] = useState(false)
  let activities: Activity[] = Array.isArray(activitiesProp) ? activitiesProp : []

  const layout =
    activities.length <= 1
      ? 'single-activity'
      : activities.length === 2
      ? '2-activities'
      : '4-activities'

  // When using activities array, determine grid column class based on layout and count
  const getGridColumnClass = () => {
    if (layout === 'single-activity') {
      return 'col-12-12_lg'
    } else if (layout === '2-activities') {
      return 'col-6-12_lg'
    } else {
      // For 4-activities layout, handle any number of activities
      // Use responsive grid that fits the number of items
      if (activities.length === 3) {
        return 'col-4-12_lg'
      }
      return 'col-3-12_lg'
    }
  }

  const handlePrevious = () => {
    if (splideRef.current) {
      splideRef.current.go('<')
    }
  }

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>')
    }
  }

  const stripHtmlToPlainText = (html: string) => {
    const withoutTags = html.replace(/<[^>]+>/g, ' ')
    return withoutTags
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&rsquo;|&#8217;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  const truncateToSentences = (text: string, maxSentences = 2) => {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0)

    if (sentences.length <= maxSentences) {
      return sentences.join(' ')
    }

    return sentences.slice(0, maxSentences).join(' ')
  }

  useEffect(() => {
    if (disableCarousel) return

    const splide = splideRef.current
    if (!splide) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const splideInstance = (splide as any).splide
    if (!splideInstance) return

    const updatePagination = (index?: number) => {
      const perPage = Math.max(splideInstance.options?.perPage ?? 1, 1)
      const slideIndex = typeof index === 'number' ? index : splideInstance.index
      const slidesCount = activities.length
      const totalPagesCount = Math.max(Math.ceil(slidesCount / perPage), 1)
      const lastStartIndex = Math.max(slidesCount - perPage, 0)

      let pageIndex = 0
      for (let page = 0; page < totalPagesCount; page++) {
        const boundary = page === totalPagesCount - 1 ? lastStartIndex : page * perPage
        if (slideIndex >= boundary) {
          pageIndex = page
        } else {
          break
        }
      }

      const controller = splideInstance.Components?.Controller
      const controllerEndIndex = controller?.getEnd?.()
      const effectiveEndIndex =
        typeof controllerEndIndex === 'number' ? controllerEndIndex : lastStartIndex

      setCurrentSlideIndex(slideIndex)
      setCurrentPage(pageIndex + 1)
      setTotalPages(totalPagesCount)
      setIsAtEndOfActivities(slideIndex >= effectiveEndIndex)
    }

    const handleMove = (newIndex: number) => updatePagination(newIndex)

    updatePagination()

    splideInstance.on('mounted', updatePagination)
    splideInstance.on('move', handleMove)
    splideInstance.on('moved', updatePagination)
    splideInstance.on('resize', updatePagination)
    splideInstance.on('updated', updatePagination)

    return () => {
      splideInstance.off('mounted', updatePagination)
      splideInstance.off('move', handleMove)
      splideInstance.off('moved', updatePagination)
      splideInstance.off('resize', updatePagination)
      splideInstance.off('updated', updatePagination)
    }
  }, [activities.length, disableCarousel])

  const renderActivityContent = (activity: Activity) => (
    <>
      {activity.thumbnail && (
        <div className="media-wrap relative">
          <img
            data-src={activity.thumbnail}
            alt=""
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />
          
          {activity.bookingHref && (
            <div className="button-wrap button-wrap--overlay-media">
              <div className="activity-booking-link">
                <ButtonLink 
                  link={{ linkType: 'external', label: 'Book', href: activity.bookingHref, color: 'orange' }}
                  fallbackColor="orange"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="activity-content">
        {activity.title && (
          <h5 className="activity-title">{activity.title}</h5>
        )}

        {activity.description && (
          <div className="activity-description">
            {Array.isArray(activity.description) ? (
              <PortableText value={activity.description} />
            ) : (
              <div>{truncateToSentences(stripHtmlToPlainText(activity.description))}</div>
            )}
          </div>
        )}

        {(activity.startsAt || activity.date) && (
          <div className="activity-date-time">
            {activity.startsAt ? formatDate(activity.startsAt) : activity.date && <>{formatDate(activity.date)}</>}
            {(activity.startsAt || activity.timeRange?.startTime) && (
              <>
                <span> • </span>
                {activity.startsAt
                  ? (activity.endsAt ? `${formatTimeFromIso(activity.startsAt)} – ${formatTimeFromIso(activity.endsAt)}` : formatTimeFromIso(activity.startsAt))
                  : activity.timeRange?.startTime && <>{formatTime(activity.timeRange)}</>
                }
              </>
            )}
          </div>
        )}
      </div>
    </>
  )

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: EVENT_TIME_ZONE,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).formatToParts(date)

      const day = Number(parts.find((part) => part.type === 'day')?.value ?? '')
      const month = parts.find((part) => part.type === 'month')?.value ?? ''
      const year = parts.find((part) => part.type === 'year')?.value ?? ''

      if (!day || !month || !year) {
        return dateString
      }
      
      // Add ordinal suffix (st, nd, rd, th)
      const getOrdinalSuffix = (n: number) => {
        const j = n % 10
        const k = n % 100
        if (j === 1 && k !== 11) return 'st'
        if (j === 2 && k !== 12) return 'nd'
        if (j === 3 && k !== 13) return 'rd'
        return 'th'
      }
      
      return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
    } catch {
      return dateString
    }
  }

  const formatTime = (timeRange?: { startTime?: string; endTime?: string }) => {
    if (!timeRange || !timeRange.startTime) return ''
    if (timeRange.endTime) return `${timeRange.startTime}-${timeRange.endTime}`
    return timeRange.startTime
  }

  const formatTimeFromIso = (iso?: string) => {
    if (!iso) return ''
    try {
      const date = new Date(iso)
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: EVENT_TIME_ZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).formatToParts(date)

      const hour = parts.find((part) => part.type === 'hour')?.value
      const minute = parts.find((part) => part.type === 'minute')?.value
      const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value

      if (!hour || !minute || !dayPeriod) {
        return iso
      }

      return `${hour}.${minute}${dayPeriod.toLowerCase()}`
    } catch {
      return iso
    }
  }

  if (activities.length === 0) {
    return null
  }

  return (
    <section id={id} className={`calendar-section layout-${layout}${disableCarousel ? ' no-carousel' : ''} h-pad`}>
      {heading && (
        <div className="calendar-section-heading out-of-opacity">
          <h4>{heading}</h4>
        </div>
      )}

      <div className={`row-lg calendar-grid layout-${layout}`}>
        {activities.map((activity) => (
          <div 
            key={activity._id} 
            className={`calendar-item ${getGridColumnClass()} out-of-opacity`}
          >
            {renderActivityContent(activity)}
          </div>
        ))}
      </div>

      {topSlot}

      {!disableCarousel && (
        <div className={`calendar-carousel layout-${layout}`}>
          <Splide
            ref={splideRef}
            options={{
              type: 'slide',
              perPage: 1,
              perMove: 1,
              gap: '40px',
              pagination: false,
              arrows: false,
              breakpoints: {
                768: {
                  perPage: 1,
                  perMove: 1,
                },
              },
            }}
          >
            {activities.map((activity) => (
              <SplideSlide key={`carousel-${activity._id}`}>
                <div className="calendar-item out-of-opacity">
                  {renderActivityContent(activity)}
                </div>
              </SplideSlide>
            ))}
          </Splide>

          {activities.length > 1 && (
            <div className="calendar-carousel-controls">
              <button
                className="carousel-arrow carousel-arrow--prev"
                onClick={handlePrevious}
                disabled={currentSlideIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="17.5"/>
                  <path d="M20.5 12L14 18.5L20.5 25"/>
                </svg>
              </button>

              <div className="carousel-pagination">
                <h6>{currentPage}/{totalPages}</h6>
              </div>

              <button
                className="carousel-arrow carousel-arrow--next"
                onClick={handleNext}
                disabled={isAtEndOfActivities}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="17.5" transform="matrix(-1 0 0 1 36 0)"/>
                  <path d="M15.5 12L22 18.5L15.5 25"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

