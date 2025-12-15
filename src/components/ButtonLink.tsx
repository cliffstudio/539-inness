"use client"

import { MouseEvent } from 'react'
import { Link as SanityLink } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'
import { BookingTab, useBooking } from '../contexts/BookingContext'

type ButtonLinkProps = {
  link: SanityLink
  className?: string
  fallbackColor?: SanityLink['color']
}

export default function ButtonLink({ link, className = '', fallbackColor = 'cream' }: ButtonLinkProps) {
  const { openBooking } = useBooking()
  const { href, text } = getLinkInfo(link)
  if (!href || !text) return null

  const color = link.color || fallbackColor || 'cream'

  // Map color values to class modifiers
  const colorClass =
    color === 'orange' ? 'button--orange' :
    color === 'outline' ? 'button--outline' :
    'button--cream'

  const bookingTab = (link.bookingTab || 'room') as BookingTab
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (link.linkType !== 'booking') return
    // Spa bookings should open mailto link, not booking overlay
    if (bookingTab === 'spa') return
    // Table bookings should open Resy URL, not booking overlay
    if (bookingTab === 'table') return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    openBooking(bookingTab)
  }

  return (
    <a
      href={href}
      className={`button ${colorClass}${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      {...(link.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
      {...(link.linkType === 'file' && { target: '_blank', rel: 'noopener noreferrer', download: link.file?.asset?.originalFilename })}
      {...(link.linkType === 'booking' && bookingTab === 'table' && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {text}
    </a>
  )
}


