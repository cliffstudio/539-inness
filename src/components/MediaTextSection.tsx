"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'
import SplideCarousel from './SplideCarousel'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'

const formatDate = (dateString?: string) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()

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
  if (!timeRange?.startTime) return ''
  if (timeRange.endTime) {
    return `${timeRange.startTime}-${timeRange.endTime}`
  }
  return timeRange.startTime
}

interface mediaTextSectionProps {
  id?: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-links' | 'media-with-text-multiple-text-blocks' | 'media-with-text-h4-body-activity-links'
  heading?: string
  body?: PortableTextBlock[]
  textBlocks?: { 
    layout?: 'h4-text' | 'h4-bullet-list'
    header?: string
    body?: PortableTextBlock[]
    bulletList?: { body?: PortableTextBlock[] }[]
  }[]
  bulletList?: { body?: PortableTextBlock[] }[]
  buttons?: Link[]
  roomLink?: {
    _id: string
    title: string
    roomType: 'cabin' | 'farmhouse'
    description?: PortableTextBlock[]
    slug: string
  }
  activityLinks?: {
    _id: string
    title: string
    description?: PortableTextBlock[]
    slug: string
    image?: SanityImage
    date?: string
    timeRange?: {
      startTime?: string
      endTime?: string
    }
  }[]
  mediaType?: 'image' | 'video'
  images?: SanityImage[]
  video?: SanityVideo
  videoPlaceholder?: SanityImage
  mediaAlignment?: 'left' | 'right'
  roomLinks?: {
    _id: string
    title: string
    roomType: 'cabin' | 'farmhouse'
    description?: PortableTextBlock[]
    slug: string
    image?: SanityImage
  }[]
  links?: {
    header?: string
    body?: PortableTextBlock[]
    image?: SanityImage
    buttons?: Link[]
  }[]
}

export default function MediaTextSection({ 
  id,
  layout = 'media-with-text-h4-body', 
  heading,
  body, 
  textBlocks,
  bulletList,
  buttons, 
  roomLink,
  mediaType = 'image',
  images, 
  video,
  videoPlaceholder,
  mediaAlignment = 'right',
  roomLinks,
  activityLinks,
  links,
}: mediaTextSectionProps) {
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isAtEndOfRoomLinks, setIsAtEndOfRoomLinks] = useState(false)

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
      const slidesCount =
        (splideInstance.Components?.Slides?.getLength
          ? splideInstance.Components.Slides.getLength()
          : splideInstance.length) ?? roomLinks?.length ?? 0
      const totalPages = Math.max(Math.ceil(slidesCount / perPage), 1)
      const lastStartIndex = Math.max(slidesCount - perPage, 0)

      let pageIndex = 0
      for (let page = 0; page < totalPages; page++) {
        const boundary = page === totalPages - 1 ? lastStartIndex : page * perPage
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
      setTotalPages(totalPages)
      setIsAtEndOfRoomLinks(slideIndex >= effectiveEndIndex)
    }

    const handleMove = (newIndex: number) => updatePagination(newIndex)

    updatePagination()

    splideInstance.on('mounted', updatePagination)
    splideInstance.on('move', handleMove)
    splideInstance.on('moved', updatePagination)
    splideInstance.on('resize', updatePagination)
    splideInstance.on('updated', updatePagination)

    return () => {
      splideInstance.off('mounted', updatePagination)
      splideInstance.off('move', handleMove)
      splideInstance.off('moved', updatePagination)
      splideInstance.off('resize', updatePagination)
      splideInstance.off('updated', updatePagination)
    }
  }, [roomLinks])

  // Handle video loading overlay removal for first video
  useEffect(() => {
    if (mediaType === 'video' && videoRef1.current) {
      const video = videoRef1.current
      
      const handleVideoLoaded = () => {
        const mediaWrap = video.parentElement
        const loadingOverlay = mediaWrap?.querySelector('.loading-overlay')
        if (loadingOverlay && loadingOverlay instanceof HTMLElement) {
          loadingOverlay.classList.add('hidden')
        }
      }

      video.addEventListener('canplaythrough', handleVideoLoaded)
      
      if (video.readyState >= 3) {
        handleVideoLoaded()
      }

      return () => {
        video.removeEventListener('canplaythrough', handleVideoLoaded)
      }
    }
  }, [mediaType, video])

  // Handle video loading overlay removal for second video (in room-type layout)
  useEffect(() => {
    if (mediaType === 'video' && videoRef2.current) {
      const video = videoRef2.current
      
      const handleVideoLoaded = () => {
        const mediaWrap = video.parentElement
        const loadingOverlay = mediaWrap?.querySelector('.loading-overlay')
        if (loadingOverlay && loadingOverlay instanceof HTMLElement) {
          loadingOverlay.classList.add('hidden')
        }
      }

      video.addEventListener('canplaythrough', handleVideoLoaded)
      
      if (video.readyState >= 3) {
        handleVideoLoaded()
      }

      return () => {
        video.removeEventListener('canplaythrough', handleVideoLoaded)
      }
    }
  }, [mediaType, video])
  return (
    <>
      {(layout === 'media-with-text-h5' || layout === 'media-with-text-h4-body' || layout === 'media-with-text-h4-bullet-list') && (
        <section id={id} className={`media-text-section layout-${layout} align-${mediaAlignment} row-lg h-pad`}>
          <div className="col-3-12_lg col-1 out-of-view">
            {heading && layout !== 'media-with-text-h5' && (
              <h4 className="media-text-heading">{heading}</h4>
            )}
            
            {body && body.length > 0 && (
              <>
                {layout === 'media-with-text-h4-body' && (
                  <div className="media-text-body">
                    <PortableText value={body ?? []} />
                  </div>
                )}

                {layout === 'media-with-text-h5' && (
                  <h5 className="media-text-body">
                    <PortableText value={body ?? []} />
                  </h5>
                )}
              </>
            )}

            {bulletList && bulletList.length > 0 && (
              <div className="media-text-bullet-list">
                {bulletList.map((item, index) => {
                  const bulletBody: PortableTextBlock[] = item?.body ?? []
                  if (bulletBody.length === 0) {
                    return null
                  }

                  return (
                    <div key={index} className="media-text-bullet-list-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                        <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                        <path d="M0.5 0.5L11.8181 15.5"/>
                      </svg>

                      <div className="media-text-bullet-list-text">
                        <PortableText value={bulletBody} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {buttons && buttons.length > 0 && (
              <div className={`button-wrap${buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                {buttons.map((button, index) => (
                  <ButtonLink key={index} link={button} fallbackColor="cream" />
                ))}
              </div>
            )}
          </div>

          <div className="col-3-12_lg dummy-col col-2"></div>

          <div className="col-6-12_lg col-3 out-of-opacity">
            {mediaType === 'image' && images && images.length > 0 && (
              <div className="media-wrap test">
                {images.length === 1 ? (
                  <>
                    <img 
                      data-src={urlFor(images[0]).url()} 
                      alt="" 
                      className="lazy full-bleed-image"
                    />
                    <div className="loading-overlay" />
                  </>
                ) : (
                  <SplideCarousel 
                    images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                    onPrevious={() => {}}
                    onNext={() => {}}
                  />
                )}
              </div>
            )}
            
            {mediaType === 'video' && video && (
              <div className="media-wrap">
                <video
                  ref={videoRef1}
                  src={videoUrlFor(video)}
                  poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="loading-overlay" />
              </div>
            )}
          </div>
        </section>
      )}

      {layout === 'media-with-text-multiple-text-blocks' && (
        <>
          <div className="desktop">
            <section id={id} className={`media-text-section layout-${layout} align-${mediaAlignment} row-lg h-pad`}>
              <div className="col-3-12_lg col-1">
                {textBlocks && textBlocks.length > 0 && (
                  <div className="media-text-multiple-blocks out-of-view">
                    {textBlocks.map((block, index) => {
                      const blockLayout = block.layout ?? 'h4-text'
                      const blockBody: PortableTextBlock[] = block.body ?? []
                      const hasBody = blockBody.length > 0
                      const hasBulletList = block.bulletList?.some((bullet) => bullet?.body && bullet.body.length > 0)

                      return (
                        <div key={index} className="media-text-block">
                          {block.header && (
                            <h5 className="media-text-heading">{block.header}</h5>
                          )}

                          {blockLayout === 'h4-text' && hasBody && (
                            <div className="media-text-body">
                              <PortableText value={blockBody} />
                            </div>
                          )}

                          {blockLayout === 'h4-bullet-list' && hasBulletList && (
                            <div className="media-text-bullet-list">
                              {block.bulletList?.map((item, itemIndex) => {
                                const bulletBody: PortableTextBlock[] = item?.body ?? []
                                if (bulletBody.length === 0) {
                                  return null
                                }

                                return (
                                  <div key={itemIndex} className="media-text-bullet-list-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                                      <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                                      <path d="M0.5 0.5L11.8181 15.5"/>
                                    </svg>

                                    <div className="media-text-bullet-list-text">
                                      <PortableText value={bulletBody} />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="col-3-12_lg dummy-col col-2"></div>

              <div className="col-6-12_lg col-3 out-of-opacity">
                {mediaType === 'image' && images && images.length > 0 && (
                  <div className="media-wrap">
                    {images.length === 1 ? (
                      <>
                        <img 
                          data-src={urlFor(images[0]).url()} 
                          alt="" 
                          className="lazy full-bleed-image"
                        />
                        <div className="loading-overlay" />
                      </>
                    ) : (
                      <SplideCarousel 
                        images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                        onPrevious={() => {}}
                        onNext={() => {}}
                      />
                    )}
                  </div>
                )}

                {mediaType === 'video' && video && (
                  <div className="media-wrap">
                    <video
                      ref={videoRef1}
                      src={videoUrlFor(video)}
                      poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="loading-overlay" />
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mobile">
            <section id={id} className={`media-text-section layout-${layout} h-pad`}>
              {textBlocks && textBlocks.length > 0 && (
                <>
                  {/* First text block only */}
                  {textBlocks[0] && (() => {
                    const block = textBlocks[0]
                    const blockLayout = block.layout ?? 'h4-text'
                    const blockBody: PortableTextBlock[] = block.body ?? []
                    const hasBody = blockBody.length > 0
                    const hasBulletList = block.bulletList?.some((bullet) => bullet?.body && bullet.body.length > 0)

                    return (
                      <div className="media-text-block">
                        {block.header && (
                          <h5 className="media-text-heading">{block.header}</h5>
                        )}

                        {blockLayout === 'h4-text' && hasBody && (
                          <div className="media-text-body">
                            <PortableText value={blockBody} />
                          </div>
                        )}

                        {blockLayout === 'h4-bullet-list' && hasBulletList && (
                          <div className="media-text-bullet-list">
                            {block.bulletList?.map((item, itemIndex) => {
                              const bulletBody: PortableTextBlock[] = item?.body ?? []
                              if (bulletBody.length === 0) {
                                return null
                              }

                              return (
                                <div key={itemIndex} className="media-text-bullet-list-item">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                                    <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                                    <path d="M0.5 0.5L11.8181 15.5"/>
                                  </svg>

                                  <div className="media-text-bullet-list-text">
                                    <PortableText value={bulletBody} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Media block */}
                  {mediaType === 'image' && images && images.length > 0 && (
                    <div className="media-wrap">
                      {images.length === 1 ? (
                        <>
                          <img 
                            data-src={urlFor(images[0]).url()} 
                            alt="" 
                            className="lazy full-bleed-image"
                          />
                          <div className="loading-overlay" />
                        </>
                      ) : (
                        <SplideCarousel 
                          images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                          onPrevious={() => {}}
                          onNext={() => {}}
                        />
                      )}
                    </div>
                  )}

                  {mediaType === 'video' && video && (
                    <div className="media-wrap">
                      <video
                        ref={videoRef1}
                        src={videoUrlFor(video)}
                        poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="loading-overlay" />
                    </div>
                  )}

                  {/* Rest of the text blocks */}
                  {textBlocks.length > 1 && (
                    <div className="media-text-multiple-blocks">
                      {textBlocks.slice(1).map((block, index) => {
                        const blockLayout = block.layout ?? 'h4-text'
                        const blockBody: PortableTextBlock[] = block.body ?? []
                        const hasBody = blockBody.length > 0
                        const hasBulletList = block.bulletList?.some((bullet) => bullet?.body && bullet.body.length > 0)

                        return (
                          <div key={index + 1} className="media-text-block">
                            {block.header && (
                              <h5 className="media-text-heading">{block.header}</h5>
                            )}

                            {blockLayout === 'h4-text' && hasBody && (
                              <div className="media-text-body">
                                <PortableText value={blockBody} />
                              </div>
                            )}

                            {blockLayout === 'h4-bullet-list' && hasBulletList && (
                              <div className="media-text-bullet-list">
                                {block.bulletList?.map((item, itemIndex) => {
                                  const bulletBody: PortableTextBlock[] = item?.body ?? []
                                  if (bulletBody.length === 0) {
                                    return null
                                  }

                                  return (
                                    <div key={itemIndex} className="media-text-bullet-list-item">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                                        <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                                        <path d="M0.5 0.5L11.8181 15.5"/>
                                      </svg>

                                      <div className="media-text-bullet-list-text">
                                        <PortableText value={bulletBody} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </>
      )}

      {layout === 'media-with-text-room-type' && roomLink && (
        <section id={id} className={`media-text-section room-type layout-${mediaAlignment} align-${mediaAlignment} row-lg h-pad`}>
          <div className="col-3-12_lg col-1 out-of-view">
            {roomLink.roomType && (
              <div className="media-text-room-type">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
                  <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                  <path d="M0.5 0.5L11.8181 15.5"/>
                  <path d="M23.1365 0.5H11.8184V15.5H23.1365V0.5Z"/>
                  <path d="M11.8184 0.5L23.1365 15.5"/>
                </svg>

                <div>{roomLink.roomType}</div>
              </div>
            )}

            <h5 className="media-text-heading">{roomLink.title}</h5>
            
            {roomLink.description && (
              <div className="media-text-body">
                <PortableText value={roomLink.description ?? []} />
              </div>
            )}

            <div className="button-wrap button-wrap--multiple-buttons">
              <ButtonLink 
                link={{ linkType: 'internal', label: 'Room Details', pageLink: { slug: `rooms/${roomLink.slug}` } }} 
                fallbackColor="cream"
              />

              {/* todo: add book room button */}
              <div className="button button--orange">
                Book Room
              </div>
            </div>
          </div>

          <div className="col-3-12_lg dummy-col col-2"></div>

          <div className="col-6-12_lg col-3 out-of-opacity">
            {mediaType === 'image' && images && images.length > 0 && (
              <div className="media-wrap">
                {images.length === 1 ? (
                  <>
                    <img 
                      data-src={urlFor(images[0]).url()} 
                      alt="" 
                      className="lazy full-bleed-image"
                    />
                    <div className="loading-overlay" />
                  </>
                ) : (
                  <SplideCarousel 
                    images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                    onPrevious={() => {}}
                    onNext={() => {}}
                  />
                )}
              </div>
            )}
            
            {mediaType === 'video' && video && (
              <div className="media-wrap">
                <video
                  ref={videoRef2}
                  src={videoUrlFor(video)}
                  poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="loading-overlay" />
              </div>
            )}
          </div>
        </section>
      )}

      {(layout === 'media-with-text-h4-body-room-links') && (
        <section id={id} className={`media-text-section layout-${layout} h-pad`}>
          <div className={`align-${mediaAlignment} row-lg`}>
            <div className="col-3-12_lg col-1 out-of-view">
              {heading && (
                <h4 className="media-text-heading">{heading}</h4>
              )}

              {body && body.length > 0 && (
                <>
                  <div className="media-text-body">
                    <PortableText value={body ?? []} />
                  </div>
                </>
              )}

              {buttons && buttons.length > 0 && (
                <div className={`button-wrap${buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                  {buttons.map((button, index) => (
                    <ButtonLink key={index} link={button} fallbackColor="cream" />
                  ))}
                </div>
              )}
            </div>

            <div className="col-3-12_lg dummy-col col-2"></div>

            <div className="col-6-12_lg col-3 out-of-opacity">
              {mediaType === 'image' && images && images.length > 0 && (
                <div className="media-wrap">
                  {images.length === 1 ? (
                    <>
                      <img 
                        data-src={urlFor(images[0]).url()} 
                        alt="" 
                        className="lazy full-bleed-image"
                      />
                      <div className="loading-overlay" />
                    </>
                  ) : (
                    <SplideCarousel 
                      images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                      onPrevious={() => {}}
                      onNext={() => {}}
                    />
                  )}
                </div>
              )}
              
              {mediaType === 'video' && video && (
                <div className="media-wrap">
                  <video
                    ref={videoRef1}
                    src={videoUrlFor(video)}
                    poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div className="loading-overlay" />
                </div>
              )}
            </div>
          </div>

          {roomLinks && roomLinks.length > 0 && (
            <>
              {roomLinks.length > 4 ? (
                <div className="media-text-links-carousel out-of-opacity">
                  <Splide
                    ref={splideRef}
                    options={{
                      type: 'slide',
                      perPage: 4,
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
                    {roomLinks.map((room, index) => (
                      <SplideSlide key={index}>
                        <div className="media-text-link">
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
                                  link={{ linkType: 'internal', label: 'View Details', pageLink: { slug: `rooms/${room.slug}` } }}
                                  fallbackColor="cream"
                                />

                                {/* todo: hook up book room button */}
                                <div className="button button--orange">
                                  Book Room
                                </div>
                              </div>
                            </div>
                          )}

                          <h5 className="media-text-heading">{room.title}</h5>

                          {room.description && (
                            <div className="media-text-body">
                              <PortableText value={room.description ?? []} />
                            </div>
                          )}
                        </div>
                      </SplideSlide>
                    ))}
                  </Splide>

                  <div className="media-text-links-carousel-controls">
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
                </div>
              ) : (
                <div className="row-lg">
                  {roomLinks.map((room, index) => (
                    <div key={index} className={roomLinks.length === 2 ? 'col-6-12_lg two-across' : 'col-3-12_lg'}>
                      <div className="media-text-link out-of-opacity">
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
                                link={{ linkType: 'internal', label: 'View Details', pageLink: { slug: `rooms/${room.slug}` } }}
                                fallbackColor="cream"
                              />

                              {/* todo: hook up book room button */}
                              <div className="button button--orange">
                                Book Room
                              </div>
                            </div>
                          </div>
                        )}

                        <h5 className="media-text-heading">{room.title}</h5>

                        {room.description && (
                          <div className="media-text-body">
                            <PortableText value={room.description ?? []} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </section>
      )}

      {(layout === 'media-with-text-h4-body-activity-links') && (
        <section id={id} className={`media-text-section layout-${layout} h-pad`}>
          <div className={`align-${mediaAlignment} row-lg`}>
            <div className="col-3-12_lg col-1 out-of-view">
              {heading && (
                <h4 className="media-text-heading">{heading}</h4>
              )}

              {body && body.length > 0 && (
                <>
                  <div className="media-text-body">
                    <PortableText value={body ?? []} />
                  </div>
                </>
              )}

              {buttons && buttons.length > 0 && (
                <div className={`button-wrap${buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                  {buttons.map((button, index) => (
                    <ButtonLink key={index} link={button} fallbackColor="cream" />
                  ))}
                </div>
              )}
            </div>

            <div className="col-3-12_lg dummy-col col-2"></div>

            <div className="col-6-12_lg col-3 out-of-opacity">
              {mediaType === 'image' && images && images.length > 0 && (
                <div className="media-wrap">
                  {images.length === 1 ? (
                    <>
                      <img 
                        data-src={urlFor(images[0]).url()} 
                        alt="" 
                        className="lazy full-bleed-image"
                      />
                      <div className="loading-overlay" />
                    </>
                  ) : (
                    <SplideCarousel 
                      images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                      onPrevious={() => {}}
                      onNext={() => {}}
                    />
                  )}
                </div>
              )}
              
              {mediaType === 'video' && video && (
                <div className="media-wrap">
                  <video
                    ref={videoRef1}
                    src={videoUrlFor(video)}
                    poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div className="loading-overlay" />
                </div>
              )}
            </div>
          </div>

      {activityLinks && activityLinks.length > 0 && (
        <>
          {activityLinks.length > 4 ? (
            <div className="media-text-links-carousel out-of-opacity">
              <Splide
                ref={splideRef}
                options={{
                  type: 'slide',
                  perPage: 4,
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
                {activityLinks.map((activity, index) => (
                  <SplideSlide key={index}>
                    <div className="media-text-link">
                      {activity.image && (
                        <div className="media-wrap relative">
                          <img 
                            data-src={urlFor(activity.image).url()} 
                            alt="" 
                            className="lazy full-bleed-image"
                          />
                          <div className="loading-overlay"></div>

                          <div className="button-wrap button-wrap--multiple-buttons button-wrap--overlay-media">
                            <ButtonLink 
                              link={{ linkType: 'internal', label: 'View', pageLink: { slug: `activities/${activity.slug}` } }}
                              fallbackColor="cream"
                            />

                            {/* todo: hook up book activity button */}
                            <div className="button button--orange">
                              Book
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="activity-content">
                        <h5 className="media-text-heading">{activity.title}</h5>

                        {activity.description && (
                          <div className="media-text-body">
                            <PortableText value={activity.description ?? []} />
                          </div>
                        )}

                        {(activity.date || activity.timeRange?.startTime) && (
                          <div className="activity-date-time">
                            {activity.date && (
                              <>{formatDate(activity.date)}</>
                            )}

                            {activity.date && activity.timeRange?.startTime && (
                              <span> • </span>
                            )}

                            {activity.timeRange?.startTime && (
                              <>{formatTime(activity.timeRange)}</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </SplideSlide>
                ))}
              </Splide>

              <div className="media-text-links-carousel-controls">
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
            </div>
          ) : (
            <div className="row-lg">
              {activityLinks.map((activity, index) => (
                <div key={index} className={activityLinks.length === 2 ? 'col-6-12_lg two-across' : 'col-3-12_lg'}>
                  <div className="media-text-link out-of-opacity">
                    {activity.image && (
                      <div className="media-wrap relative">
                        <img 
                          data-src={urlFor(activity.image).url()} 
                          alt="" 
                          className="lazy full-bleed-image"
                        />
                        <div className="loading-overlay" />

                        <div className="button-wrap button-wrap--multiple-buttons button-wrap--overlay-media">
                          <ButtonLink 
                            link={{ linkType: 'internal', label: 'View Details', pageLink: { slug: `activities/${activity.slug}` } }}
                            fallbackColor="cream"
                          />

                          {/* todo: hook up book activity button */}
                          <div className="button button--orange">
                            Book Activity
                          </div>
                        </div>
                      </div>
                    )}

                    <h5 className="media-text-heading">{activity.title}</h5>

                    {activity.description && (
                      <div className="media-text-body">
                        <PortableText value={activity.description ?? []} />
                      </div>
                    )}

                    {(activity.date || activity.timeRange?.startTime) && (
                      <div className="activity-date-time">
                        {activity.date && (
                          <>{formatDate(activity.date)}</>
                        )}

                        {activity.date && activity.timeRange?.startTime && (
                          <span> • </span>
                        )}

                        {activity.timeRange?.startTime && (
                          <>{formatTime(activity.timeRange)}</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

        </section>
      )}

      {(layout === 'media-with-text-h4-body-links') && links && links.length > 0 && (
        <section id={id} className={`media-text-section layout-${layout} h-pad`}>
          <div className={`align-${mediaAlignment} row-lg`}>
            <div className="col-3-12_lg col-1 out-of-view">
              {heading && (
                <h4 className="media-text-heading">{heading}</h4>
              )}

              {body && body.length > 0 && (
                <div className="media-text-body">
                  <PortableText value={body ?? []} />
                </div>
              )}

              {buttons && buttons.length > 0 && (
                <div className={`button-wrap${buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''}`}>
                  {buttons.map((button, index) => (
                    <ButtonLink key={index} link={button} fallbackColor="cream" />
                  ))}
                </div>
              )}
            </div>

            <div className="col-3-12_lg dummy-col col-2"></div>

            <div className="col-6-12_lg col-3 out-of-opacity">
              {mediaType === 'image' && images && images.length > 0 && (
                <div className="media-wrap">
                  {images.length === 1 ? (
                    <>
                      <img 
                        data-src={urlFor(images[0]).url()} 
                        alt="" 
                        className="lazy full-bleed-image"
                      />
                      <div className="loading-overlay" />
                    </>
                  ) : (
                    <SplideCarousel 
                      images={images.map(image => ({ url: urlFor(image).url(), alt: "" }))}
                      onPrevious={() => {}}
                      onNext={() => {}}
                    />
                  )}
                </div>
              )}
              
              {mediaType === 'video' && video && (
                <div className="media-wrap">
                  <video
                    ref={videoRef1}
                    src={videoUrlFor(video)}
                    poster={videoPlaceholder ? urlFor(videoPlaceholder).url() : undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                  <div className="loading-overlay" />
                </div>
              )}
            </div>
          </div>

          {links && links.length > 0 && (
            <div className="media-text-links-list row-lg">
              {links.map((link, index) => (
                <div key={index} className={links.length === 2 ? 'col-6-12_lg two-across' : 'col-3-12_lg'}>
                  <div className="media-text-link out-of-opacity">
                    {link.image && (
                      <div className="media-wrap relative">
                        <img 
                          data-src={urlFor(link.image).url()} 
                          alt="" 
                          className="lazy full-bleed-image"
                        />
                        <div className="loading-overlay" />

                        {link.buttons && link.buttons.length > 0 && (
                          <div className={`button-wrap${link.buttons.length > 1 ? ' button-wrap--multiple-buttons' : ''} button-wrap--overlay-media`}>
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

                    {link.body && (
                      <div className="media-text-body">
                        <PortableText value={link.body ?? []} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}
