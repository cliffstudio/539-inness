'use client'

import { useMemo } from 'react'
import { PortableTextBlock } from '@portabletext/react'
import CalendarPage from './CalendarPage'
import { SanityImage } from '../types/sanity'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface Activity {
  _id: string
  title?: string
  startsAt?: string
  endsAt?: string
  locationAddress?: string
  images?: SanityImage[]
  description?: string | PortableTextBlock[]
  thumbnail?: string
  bookingHref?: string
  slug?: string
  eventCategories?: string[]
  contentBlocks?: ContentBlock[]
}

interface CalendarSectionProps {
  id?: string
  heading?: string
  eventCategories?: string[]
  activities?: Activity[]
}

export default function CalendarSection({
  id,
  heading,
  eventCategories,
  activities = [],
}: CalendarSectionProps) {
  const filteredActivities = useMemo(() => {
    const selectedCategories = Array.isArray(eventCategories)
      ? eventCategories
          .filter(
            (category): category is string =>
              typeof category === 'string' && category.length > 0
          )
          .map((category) => category.trim().toLowerCase())
      : []

    const byCategory =
      selectedCategories.length > 0
        ? activities.filter((activity) => {
            const categories = Array.isArray(activity.eventCategories)
              ? activity.eventCategories
                  .filter((category): category is string => typeof category === 'string')
                  .map((category) => category.trim().toLowerCase())
              : []

            return categories.some((category) => selectedCategories.includes(category))
          })
        : activities

    const now = Date.now()

    return byCategory
      .filter((activity) => {
        if (!activity.startsAt) return false
        const startsAtTime = new Date(activity.startsAt).getTime()
        return Number.isFinite(startsAtTime) && startsAtTime >= now
      })
      .slice()
      .sort((a, b) => {
        const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY
        const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
      })
      .slice(0, 4)
  }, [activities, eventCategories])

  if (filteredActivities.length === 0) {
    return (
      <section id={id} className="calendar-section h-pad">
        {heading && (
          <div className="calendar-section-heading out-of-opacity">
            <h4>{heading}</h4>
          </div>
        )}
        <div className="row-lg calendar-grid">
          <div className="calendar-item col-12-12_lg out-of-opacity">
            <div className="activity-content">
              <p>No events found for the selected category.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <CalendarPage id={id} heading={heading} activities={filteredActivities} />
}
