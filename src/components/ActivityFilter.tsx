'use client'

import { useState, useMemo, useEffect } from 'react'
import { PortableTextBlock } from '@portabletext/react'
import ActivitySection from './ActivitySection'
import mediaLazyloading from '../utils/lazyLoad'
import { SanityImage } from '../types/sanity'

interface Activity {
  _id: string
  title?: string
  date?: string
  timeRange?: {
    startTime?: string
    endTime?: string
  }
  images?: SanityImage[]
  description?: PortableTextBlock[]
  bookingHref?: string
  slug?: string
  activityType?: string
}

interface ActivityFilterProps {
  activities: Activity[]
  layout?: 'single-activity' | '2-activities' | '4-activities'
}

export default function ActivityFilter({ activities, layout = '4-activities' }: ActivityFilterProps) {
  // Get unique activity types from the activities data
  const availableActivityTypes = useMemo(() => {
    const types = new Set<string>()
    activities.forEach(activity => {
      if (activity.activityType) {
        types.add(activity.activityType)
      }
    })
    return Array.from(types).sort()
  }, [activities])

  type FilterType = 'all' | string
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') {
      return activities
    }
    return activities.filter(activity => activity.activityType === activeFilter)
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
      <div className="activity-filter h-pad">
        <div className="activity-filter-label out-of-opacity">Filter</div>

        <div className="activity-filter-options out-of-opacity">
          <button
            className={`activity-filter-option ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <div className="activity-filter-box">
              <div className="activity-filter-box-inner"></div>
            </div>
            <div className="activity-filter-label">All</div>
          </button>
          {availableActivityTypes.map((activityType) => {
            // Map activity type values to their display titles
            const activityTypeLabels: Record<string, string> = {
              'wellness': 'Wellness',
              'food-and-beverage': 'Food & Beverage',
              'kids': 'Kids',
              'golf': 'Golf',
            }
            const displayLabel = activityTypeLabels[activityType] || activityType.charAt(0).toUpperCase() + activityType.slice(1).toLowerCase()
            return (
              <button
                key={activityType}
                className={`activity-filter-option ${activeFilter === activityType ? 'active' : ''}`}
                onClick={() => setActiveFilter(activityType)}
              >
                <div className="activity-filter-box">
                  <div className="activity-filter-box-inner"></div>
                </div>
                <div className="activity-filter-label">{displayLabel}</div>
              </button>
            )
          })}
        </div>
      </div>

      <ActivitySection layout={layout} activities={filteredActivities} disableCarousel={true} />
    </>
  )
}

