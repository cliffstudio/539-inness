'use client'

export interface CalendarEvent {
  _id: string
  title?: string
  slug?: { current?: string }
  startsAt?: string
  endsAt?: string
  locationName?: string
  locationAddress?: string
  description?: string
  thumbnail?: string
  eventCategories?: string[]
}

function formatCalendarDate(iso?: string) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const day = d.getDate()
    const month = d.toLocaleString('en-US', { month: 'long' })
    const year = d.getFullYear()
    const getOrdinal = (n: number) => {
      const j = n % 10
      const k = n % 100
      if (j === 1 && k !== 11) return 'st'
      if (j === 2 && k !== 12) return 'nd'
      if (j === 3 && k !== 13) return 'rd'
      return 'th'
    }
    return `${day}${getOrdinal(day)} ${month} ${year}`
  } catch {
    return iso
  }
}

function formatCalendarTime(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}

export default function CalendarPage(event: CalendarEvent) {
  const dateStr = formatCalendarDate(event.startsAt)
  const startTime = formatCalendarTime(event.startsAt)
  const endTime = event.endsAt ? formatCalendarTime(event.endsAt) : null
  const timeStr = startTime ? (endTime ? `${startTime} – ${endTime}` : startTime) : ''

  return (
    <>
      <section className="hero-section layout-2 h-pad">
        <div className="hero-image relative out-of-opacity">
          <div className="fill-space-image-wrap media-wrap">
            <img
              data-src={event.thumbnail}
              alt=""
              className="lazy full-bleed-image"
            />
            <div className="loading-overlay" />
          </div>
        </div>

        <div className="hero-content out-of-opacity">
          <div className="row-1">
            {event.title && <h3 className="calendar-detail-title">{event.title}</h3>}

            {/* <div>Members + Hotel Guests Only</div> */}
          </div>
        </div>
      </section>

      {/* {contentBlocks && contentBlocks.length > 0 && (
        <FlexibleContent contentBlocks={contentBlocks} />
      )} */}
    </>
  )
}
