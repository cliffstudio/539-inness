import { Link } from '../types/footerSettings'
import { fileUrlFor } from '../sanity/utils/fileUrlBuilder'

export const getLinkInfo = (cta?: Link) => {
  if (!cta) return { text: '', href: '' }
  
  if (cta.linkType === 'external') {
    return { text: cta.label || '', href: cta.href || '' }
  } else if (cta.linkType === 'jump') {
    return { text: cta.label || '', href: cta.jumpLink ? `#${cta.jumpLink}` : '' }
  } else if (cta.linkType === 'file') {
    const href = cta.file ? fileUrlFor(cta.file) : ''
    return { text: cta.label || '', href }
  } else if (cta.linkType === 'booking') {
    // For booking links, create URL with booking parameter
    const bookingTab = cta.bookingTab || 'room'
    const tabLabels: Record<string, string> = {
      'room': 'Book a Room',
      'table': 'Book a Table',
      'golf': 'Book a Tee Time',
      'spa': 'Book a Treatment',
      'activity': 'Book Activity',
    }
    const text = cta.label || tabLabels[bookingTab] || 'Book'
    // Spa bookings should open mailto link instead of booking overlay
    if (bookingTab === 'spa') {
      return { text, href: 'mailto:spa@inness.co' }
    }
    // Table bookings should open Resy URL instead of booking overlay
    if (bookingTab === 'table') {
      return { text, href: 'https://resy.com/cities/accord-ny/venues/inness' }
    }
    // Golf bookings should open Chronogolf URL instead of booking overlay
    if (bookingTab === 'golf') {
      // Get today's date in YYYY-MM-DD format
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      return { text, href: `https://www.chronogolf.com/club/inness-resort?date=${dateString}` }
    }
    return { text, href: '#booking' }
  } else {
    // For internal links, use label if provided, otherwise fallback to page title
    const text = cta.label || cta.pageLink?.title || ''
    return { text, href: cta.pageLink?.slug ? `/${cta.pageLink.slug}` : '' }
  }
}
