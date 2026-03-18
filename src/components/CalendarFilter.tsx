'use client'

import { useState, useMemo, useEffect } from 'react'
import { PortableTextBlock } from '@portabletext/react'
import ActivitySection from './CalendarSection'
import mediaLazyloading from '../utils/lazyLoad'
import { SanityImage } from '../types/sanity'
import Link from 'next/link'

interface Activity {
  _id: string
  title?: string
  date?: string
  timeRange?: {
    startTime?: string
    endTime?: string
  }
  startsAt?: string
  endsAt?: string
  locationName?: string
  locationAddress?: string
  images?: SanityImage[]
  // Can be plain Peoplevine text or rich Sanity PortableText
  description?: string | PortableTextBlock[]
  bookingHref?: string
  slug?: string
  eventCategories?: string[]
  contentBlocks?: { _type: string }[]
}

interface CalendarFilterProps {
  activities: Activity[]
  layout?: 'single-activity' | '2-activities' | '4-activities'
  pagination?: {
    baseHref: string
    currentPage: number
    totalPages: number
  }
}

export default function CalendarFilter({ activities, layout = '4-activities', pagination }: CalendarFilterProps) {
  // Get unique event categories from the activities data
  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    activities.forEach((activity) => {
      activity.eventCategories?.forEach((cat) => {
        if (cat) {
          categories.add(cat)
        }
      })
    })
    return Array.from(categories).sort()
  }, [activities])

  type FilterType = 'all' | string
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') {
      return activities
    }
    return activities.filter((activity) =>
      activity.eventCategories?.includes(activeFilter)
    )
  }, [activities, activeFilter])

  // Re-initialize lazy loading when filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      mediaLazyloading().catch(console.error)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [activeFilter, filteredActivities])

  return (
    <>
      <div className="calendar-filter h-pad">
        <div className="calendar-filter-label out-of-opacity">Filter</div>

        <div className="calendar-filter-options out-of-opacity">
          <button
            className={`calendar-filter-option ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <div className="calendar-filter-box">
              <div className="calendar-filter-box-inner"></div>
            </div>
            <div className="calendar-filter-label">All</div>
          </button>
          {availableCategories.map((category) => {
            const displayLabel =
              category.charAt(0).toUpperCase() + category.slice(1)
            return (
              <button
                key={category}
                className={`calendar-filter-option ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                <div className="calendar-filter-box">
                  <div className="calendar-filter-box-inner"></div>
                </div>
                <div className="calendar-filter-label">{displayLabel}</div>
              </button>
            )
          })}
        </div>
      </div>

      <ActivitySection
        layout={layout}
        activities={filteredActivities}
        disableCarousel={true}
        topSlot={
          pagination ? (
            <div className="calendar-pagination">
              {pagination.currentPage > 1 ? (
                <Link
                  className="calendar-pagination__link"
                  href={`${pagination.baseHref}?page=${pagination.currentPage - 1}`}
                >
                  Previous
                </Link>
              ) : (
                <span className="calendar-pagination__link calendar-pagination__link--disabled">
                  Previous
                </span>
              )}

              <span className="calendar-pagination__status">
                {pagination.currentPage} of {pagination.totalPages}
              </span>

              {pagination.currentPage < pagination.totalPages ? (
                <Link
                  className="calendar-pagination__link"
                  href={`${pagination.baseHref}?page=${pagination.currentPage + 1}`}
                >
                  Next
                </Link>
              ) : (
                <span className="calendar-pagination__link calendar-pagination__link--disabled">
                  Next
                </span>
              )}
            </div>
          ) : null
        }
      />
    </>
  )
}

