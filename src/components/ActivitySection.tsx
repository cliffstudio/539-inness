'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import ButtonLink from './ButtonLink'

interface Activity {
  _id: string
  title?: string
  date?: string
  timeRange?: {
    startTime?: string
    endTime?: string
  }
  image?: SanityImage
  description?: PortableTextBlock[]
  bookingHref?: string
  slug?: string
  activityType?: string
}

interface ActivitySectionProps {
  id?: string
  layout?: 'single-activity' | '2-activities' | '4-activities'
  heading?: string
  activity1?: Activity
  activity2?: Activity
  activity3?: Activity
  activity4?: Activity
  activities?: Activity[] // Array of activities (used when showing all activities)
  disableCarousel?: boolean // Disable carousel (for activities page)
}

export default function ActivitySection({ 
  id,
  layout = 'single-activity',
  heading,
  activity1,
  activity2,
  activity3,
  activity4,
  activities: activitiesProp,
  disableCarousel = false,
}: ActivitySectionProps) {
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isAtEndOfActivities, setIsAtEndOfActivities] = useState(false)

  // If activities array is provided, use it; otherwise collect from individual props
  let activities: Activity[] = []
  
  if (activitiesProp && activitiesProp.length > 0) {
    // Use the provided activities array
    activities = activitiesProp
    
    // Determine layout based on number of activities if not explicitly set
    if (!layout || layout === 'single-activity') {
      if (activities.length === 1) {
        layout = 'single-activity'
      } else if (activities.length === 2) {
        layout = '2-activities'
      } else if (activities.length >= 3) {
        layout = '4-activities'
      }
    }
  } else {
    // Collect activities from individual props based on layout
    if (activity1) activities.push(activity1)
    if (layout === '2-activities' || layout === '4-activities') {
      if (activity2) activities.push(activity2)
    }
    if (layout === '4-activities') {
      if (activity3) activities.push(activity3)
      if (activity4) activities.push(activity4)
    }
  }

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

  useEffect(() => {
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
  }, [activities.length])

  const renderActivityContent = (activity: Activity) => (
    <>
      {activity.image && (
        <div className="media-wrap relative">
          <img 
            data-src={urlFor(activity.image).url()} 
            alt={activity.title || ''} 
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />

          <div className="button-wrap button-wrap--multiple-buttons button-wrap--overlay-media">
            <ButtonLink 
              link={{ linkType: 'internal', label: 'View', pageLink: { slug: `calendar/${activity.slug || ''}` }, color: 'cream' }}
              fallbackColor="cream"
            />

            {activity.bookingHref && (
              <div className="activity-booking-link">
                <ButtonLink 
                  link={{ linkType: 'external', label: 'Book', href: activity.bookingHref, color: 'orange' }}
                  fallbackColor="orange"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="activity-content">
        {activity.title && (
          <h5 className="activity-title">{activity.title}</h5>
        )}

        {activity.description && (
          <div className="activity-description">
            <PortableText value={activity.description} />
          </div>
        )}

        {activity.date && activity.timeRange?.startTime && (
          <div className="activity-date-time">
            {activity.date && (
              <>{formatDate(activity.date)}</>
            )}

            <span> • </span>

            {activity.timeRange?.startTime && (
              <>{formatTime(activity.timeRange)}</>
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
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'long' })
      const year = date.getFullYear()
      
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
    
    if (timeRange.endTime) {
      return `${timeRange.startTime}-${timeRange.endTime}`
    }
    
    return timeRange.startTime
  }

  if (activities.length === 0) {
    return null
  }

  return (
    <section id={id} className={`activity-section layout-${layout}${disableCarousel ? ' no-carousel' : ''} h-pad`}>
      {heading && (
        <div className="activity-section-heading out-of-opacity">
          <h4>{heading}</h4>
        </div>
      )}

      <div className={`row-lg activity-grid layout-${layout}`}>
        {activities.map((activity) => (
          <div 
            key={activity._id} 
            className={`activity-item ${getGridColumnClass()} out-of-opacity`}
          >
            {renderActivityContent(activity)}
          </div>
        ))}
      </div>

      {!disableCarousel && (
        <div className={`activity-carousel layout-${layout}`}>
          <Splide
            ref={splideRef}
            options={{
              type: 'slide',
              perPage: 1,
              perMove: 1,
              gap: '20px',
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
                <div className="activity-item out-of-opacity">
                  {renderActivityContent(activity)}
                </div>
              </SplideSlide>
            ))}
          </Splide>

          {activities.length > 1 && (
            <div className="activity-carousel-controls">
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

