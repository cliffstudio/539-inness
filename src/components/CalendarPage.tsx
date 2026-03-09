'use client'

export interface CalendarEvent {
  _id: string
  title?: string
  slug?: { current?: string }
  startsAt?: string
  endsAt?: string
  locationName?: string
  locationAddress?: string
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
    <section className="calendar-detail h-pad">
      <div className="calendar-detail-content">
        {event.title && <h1 className="calendar-detail-title">{event.title}</h1>}
        {(dateStr || timeStr) && (
          <div className="calendar-detail-date-time">
            {dateStr}
            {dateStr && timeStr && ' • '}
            {timeStr}
          </div>
        )}
        {event.locationName && (
          <div className="calendar-detail-location">
            <strong>Location:</strong> {event.locationName}
          </div>
        )}
        {event.locationAddress && (
          <div className="calendar-detail-address">{event.locationAddress}</div>
        )}
      </div>
    </section>
  )
}
