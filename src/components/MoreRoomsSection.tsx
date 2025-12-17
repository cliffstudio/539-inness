"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import ButtonLink from './ButtonLink'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'
import mediaLazyloading from '../utils/lazyLoad'

interface OtherRoom {
  _id: string
  title: string
  roomType: 'cabin' | 'farmhouse'
  description?: PortableTextBlock[]
  slug: string
  image?: SanityImage
}

interface MoreRoomsSectionProps {
  heading?: string
  roomLinks?: OtherRoom[]
}

export default function MoreRoomsSection({ 
  heading = 'More Rooms',
  roomLinks,
}: MoreRoomsSectionProps) {
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isAtEndOfRoomLinks, setIsAtEndOfRoomLinks] = useState(false)

  // Limit to 4 rooms
  const limitedRooms = roomLinks && roomLinks.length > 0 ? roomLinks.slice(0, 4) : []

  const handlePrevious = () => {
    if (splideRef.current) {
      splideRef.current.go('<')
    }
  }

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>')
    }
  }

  // Initialize lazy loading when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      mediaLazyloading().catch(console.error)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Track splide carousel page changes
  useEffect(() => {
    const splide = splideRef.current
    if (!splide) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const splideInstance = (splide as any).splide
    if (!splideInstance) return

    const updatePagination = (index?: number) => {
      const perPage = Math.max(splideInstance.options?.perPage ?? 1, 1)
      const slideIndex = typeof index === 'number' ? index : splideInstance.index
      const slidesCount = limitedRooms.length
      const totalPagesCount = Math.max(Math.ceil(slidesCount / perPage), 1)
      const lastStartIndex = Math.max(slidesCount - perPage, 0)

      let pageIndex = 0
      for (let page = 0; page < totalPagesCount; page++) {
        const boundary = page === totalPagesCount - 1 ? lastStartIndex : page * perPage
        if (slideIndex >= boundary) {
          pageIndex = page
        } else {
          break
        }
      }

      const controller = splideInstance.Components?.Controller
      const controllerEndIndex = controller?.getEnd?.()
      const effectiveEndIndex =
        typeof controllerEndIndex === 'number' ? controllerEndIndex : lastStartIndex

      setCurrentSlideIndex(slideIndex)
      setCurrentPage(pageIndex + 1)
      setTotalPages(totalPagesCount)
      setIsAtEndOfRoomLinks(slideIndex >= effectiveEndIndex)
    }

    const handleMove = (newIndex: number) => {
      updatePagination(newIndex)
    }

    const handleMoved = (newIndex: number) => {
      updatePagination(newIndex)
      // Update lazy loading after slide change
      setTimeout(() => {
        mediaLazyloading().then((instance) => {
          if (instance) {
            instance.update()
          }
        }).catch(console.error)
      }, 50)
    }

    updatePagination()

    // Update lazy loading when carousel is mounted
    setTimeout(() => {
      mediaLazyloading().then((instance) => {
        if (instance) {
          instance.update()
        }
      }).catch(console.error)
    }, 100)

    splideInstance.on('mounted', updatePagination)
    splideInstance.on('move', handleMove)
    splideInstance.on('moved', handleMoved)
    splideInstance.on('resize', updatePagination)
    splideInstance.on('updated', updatePagination)

    return () => {
      splideInstance.off('mounted', updatePagination)
      splideInstance.off('move', handleMove)
      splideInstance.off('moved', updatePagination)
      splideInstance.off('resize', updatePagination)
      splideInstance.off('updated', updatePagination)
    }
  }, [limitedRooms.length])

  if (!roomLinks || roomLinks.length === 0) {
    return null
  }

  const renderRoomContent = (room: OtherRoom) => (
    <>
      {room.image && (
        <div className="media-wrap relative">
          <img 
            data-src={urlFor(room.image).url()} 
            alt="" 
            className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />

          <div className="button-wrap button-wrap--multiple-buttons button-wrap--overlay-media">
            <ButtonLink 
              link={{ linkType: 'internal', label: 'View', pageLink: { slug: `rooms/${room.slug}` } }}
              fallbackColor="cream"
            />

            <button
              type="button"
              className="button button--orange namastay-widget-button"
            >
              Book
            </button>
          </div>
        </div>
      )}

      <h5 className="media-text-heading">{room.title}</h5>

      {room.description && (
        <div className="media-text-body">
          <PortableText value={room.description ?? []} />
        </div>
      )}
    </>
  )

  return (
    <section className="more-rooms-section h-pad">
      {heading && (
        <h4 className="section-heading">{heading}</h4>
      )}

      {/* Desktop: Grid layout */}
      <div className="row-lg more-rooms-grid">
        {limitedRooms.map((room, index) => (
          <div key={index} className={limitedRooms.length === 2 ? 'col-6-12_lg two-across' : 'col-3-12_lg'}>
            <div className="media-text-link out-of-opacity">
              {renderRoomContent(room)}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Carousel */}
      <div className="more-rooms-carousel">
        <Splide
          ref={splideRef}
          options={{
            type: 'slide',
            perPage: 1,
            perMove: 1,
            gap: '20px',
            pagination: false,
            arrows: false,
            breakpoints: {
              768: {
                perPage: 1,
                perMove: 1,
              },
            },
          }}
        >
          {limitedRooms.map((room, index) => (
            <SplideSlide key={`carousel-${room._id || index}`}>
              <div className="media-text-link out-of-opacity">
                {renderRoomContent(room)}
              </div>
            </SplideSlide>
          ))}
        </Splide>

        {limitedRooms.length > 1 && (
          <div className="more-rooms-carousel-controls">
            <button 
              className="carousel-arrow carousel-arrow--prev"
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="17.5"/>
                <path d="M20.5 12L14 18.5L20.5 25"/>
              </svg>
            </button>

            <div className="carousel-pagination">
              <h6>{currentPage}/{totalPages}</h6>
            </div>

            <button 
              className="carousel-arrow carousel-arrow--next"
              onClick={handleNext}
              disabled={isAtEndOfRoomLinks}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17.5" transform="matrix(-1 0 0 1 36 0)"/>
                <path d="M15.5 12L22 18.5L15.5 25"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

