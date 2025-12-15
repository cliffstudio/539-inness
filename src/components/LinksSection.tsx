"use client"

/* eslint-disable @next/next/no-img-element */
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'
import '@splidejs/react-splide/css'

interface LinksSectionProps {
  id?: string
  links?: {
    header?: string
    body?: PortableTextBlock[]
    date?: string
    image?: SanityImage
    buttons?: Link[]
  }[]
}

export default function LinksSection({ id, links }: LinksSectionProps) {
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

  if (!links || links.length === 0) {
    return null
  }

  // Sort links by date (newest first), links without dates go to the end
  const sortedLinks = [...links].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <section id={id} className="links-section h-pad row-lg">
      <div className="inner-wrap row-lg">
        {sortedLinks.map((link, index) => (
          <div key={index} className="col-3-12_lg out-of-opacity">
            <div className="media-text-link">
              {link.image && (
                <div className="media-wrap">
                  <img 
                    data-src={urlFor(link.image).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />

                  {link.buttons && link.buttons.length > 0 && (
                    <div className={`button-wrap button-wrap--overlay-media${link.buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                      {link.buttons.map((button, buttonIndex) => (
                        <ButtonLink key={buttonIndex} link={button} fallbackColor="cream" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {link.header && (
                <h5 className="media-text-heading">{link.header}</h5>
              )}

              {link.body && link.body.length > 0 && (
                <div className="media-text-body">
                  <PortableText value={link.body} />
                </div>
              )}

              {link.date && (
                <div className="media-text-date">{formatDate(link.date)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

