/* eslint-disable @next/next/no-img-element */
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'

interface EventSectionProps {
  id?: string
  layout?: 'single-event' | '2-events' | '4-events'
  heading?: string
  events?: {
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
  }[]
}

export default function EventSection({ 
  id,
  layout = 'single-event',
  heading,
  events,
}: EventSectionProps) {
  if (!events || events.length === 0) {
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'long' })
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
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
    <section id={id} className={`event-section layout-${layout} h-pad`}>
      {heading && (
        <div className="event-section-heading">
          <h4>{heading}</h4>
        </div>
      )}

      <div className={`row-lg event-grid layout-${layout}`}>
        {events.map((event) => (
          <div 
            key={event._id} 
            className={`event-item ${layout === 'single-event' ? 'col-12-12_lg' : layout === '2-events' ? 'col-6-12_lg' : 'col-3-12_lg'}`}
          >
            {event.image && (
              <div className="media-wrap">
                <img 
                  data-src={urlFor(event.image).url()} 
                  alt={event.title || ''} 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />

                <div className="event-buttons">
                  <a href={`/events/${event.slug}`} className="button button--cream">
                    Event Information
                  </a>

                  {event.bookingHref && (
                    <div className="event-booking-link">
                      <a href={event.bookingHref} className="button button--orange" target="_blank" rel="noopener noreferrer">
                        Book Event
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="event-content">
              {event.title && (
                <h5 className="event-title">{event.title}</h5>
              )}

              {event.description && (
                <div className="event-description">
                  <PortableText value={event.description} />
                </div>
              )}

              {event.date && event.timeRange?.startTime && (
                <div className="event-date-time">
                  {event.date && (
                    <>{formatDate(event.date)}</>
                  )}

                  <span> • </span>

                  {event.timeRange?.startTime && (
                    <>{formatTime(event.timeRange)}</>
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

