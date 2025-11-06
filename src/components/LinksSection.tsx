"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'

interface LinksSectionProps {
  id?: string
  links?: {
    header?: string
    body?: PortableTextBlock[]
    image?: SanityImage
    buttons?: Link[]
  }[]
}

export default function LinksSection({ id, links }: LinksSectionProps) {
  const linksSplideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [linksCurrentPage, setLinksCurrentPage] = useState(1)
  const linksTotalPages = links ? Math.ceil(links.length / 4) : 1

  const handleLinksPrevious = () => {
    if (linksSplideRef.current) {
      linksSplideRef.current.go('<')
    }
  }

  const handleLinksNext = () => {
    if (linksSplideRef.current) {
      linksSplideRef.current.go('>')
    }
  }

  // Track links splide carousel page changes
  useEffect(() => {
    const splide = linksSplideRef.current
    if (!splide) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const splideInstance = (splide as any).splide
    if (!splideInstance) return

    const handlePageChange = () => {
      const page = splideInstance.index + 1
      setLinksCurrentPage(page)
    }

    splideInstance.on('moved', handlePageChange)

    return () => {
      splideInstance.off('moved', handlePageChange)
    }
  }, [links])

  if (!links || links.length === 0) {
    return null
  }

  return (
    <section id={id} className="links-section h-pad row-lg">
      <div className="inner-wrap row-lg">
        {links.map((link, index) => (
          <div key={index} className="col-3-12_lg">
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
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

