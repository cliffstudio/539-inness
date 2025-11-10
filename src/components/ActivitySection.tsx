/* eslint-disable @next/next/no-img-element */
import { PortableText, PortableTextBlock } from '@portabletext/react'
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
}: ActivitySectionProps) {
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

  if (activities.length === 0) {
    return null
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

  return (
    <section id={id} className={`activity-section layout-${layout} h-pad`}>
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
            {activity.image && (
              <div className="media-wrap">
                <img 
                  data-src={urlFor(activity.image).url()} 
                  alt={activity.title || ''} 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />

                <div className="button-wrap button-wrap--multiple-buttons button-wrap--overlay-media">
                  <ButtonLink 
                    link={{ linkType: 'internal', label: 'Activity Information', pageLink: { slug: `activities/${activity.slug || ''}` }, color: 'cream' }}
                    fallbackColor="cream"
                  />

                  {activity.bookingHref && (
                    <div className="activity-booking-link">
                      <ButtonLink 
                        link={{ linkType: 'external', label: 'Book Activity', href: activity.bookingHref, color: 'orange' }}
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
          </div>
        ))}
      </div>
    </section>
  )
}

