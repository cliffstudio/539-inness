"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'
import SplideCarousel from './SplideCarousel'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/splide/css'

interface mediaTextSectionProps {
  id?: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-links'
  heading?: string
  body?: PortableTextBlock[]
  bulletList?: string[]
  buttons?: Link[]
  roomLink?: {
    _id: string
    title: string
    roomType: 'cabin' | 'farmhouse'
    description?: PortableTextBlock[]
    slug: string
  }
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
    description?: PortableTextBlock[]
    image?: SanityImage
    buttons?: Link[]
  }[]
}

export default function MediaTextSection({ 
  id,
  layout = 'media-with-text-h4-body', 
  heading,
  body, 
  bulletList,
  buttons, 
  roomLink,
  mediaType = 'image',
  images, 
  video,
  videoPlaceholder,
  mediaAlignment = 'right',
  roomLinks,
  links,
}: mediaTextSectionProps) {
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)
  const splideRef = useRef<{ go: (direction: string) => void } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = roomLinks ? Math.ceil(roomLinks.length / 4) : 1

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

    const handlePageChange = () => {
      const page = splideInstance.index + 1
      setCurrentPage(page)
    }

    splideInstance.on('moved', handlePageChange)

    return () => {
      splideInstance.off('moved', handlePageChange)
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
          <div className="col-3-12_lg col-1">
            {heading && layout !== 'media-with-text-h5' && (
              <h4 className="media-text-heading">{heading}</h4>
            )}
            
            {body && body.length > 0 && (
              <>
                {layout === 'media-with-text-h4-body' && (
                  <div className="media-text-body">
                    <PortableText value={body} />
                  </div>
                )}

                {layout === 'media-with-text-h5' && (
                  <h5 className="media-text-body">
                    <PortableText value={body} />
                  </h5>
                )}
              </>
            )}

            {bulletList && bulletList.length > 0 && (
              <div className="media-text-bullet-list">
                {bulletList.map((item, index) => (
                  <div key={index} className="media-text-bullet-list-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16">
                      <path d="M11.8181 0.5H0.5V15.5H11.8181V0.5Z"/>
                      <path d="M0.5 0.5L11.8181 15.5"/>
                    </svg>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {buttons && buttons.length > 0 && (
              <div className={`media-text-buttons${buttons.length > 1 ? ' multiple-buttons' : ''}`}>
                {buttons.map((button, index) => {
                  const linkInfo = getLinkInfo(button)
                  if (!linkInfo.text || !linkInfo.href) return null
                  return (
                    <a 
                      key={index}
                      href={linkInfo.href}
                      className={`button button--${button.color || 'cream'}`}
                      {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {linkInfo.text}
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <div className="col-3-12_lg dummy-col col-2"></div>

          <div className="col-6-12_lg col-3">
            {mediaType === 'image' && images && images.length > 0 && (
              <div className="media-wrap">
                {images.length === 1 ? (
                  <img 
                    data-src={urlFor(images[0]).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
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

      {layout === 'media-with-text-room-type' && roomLink && (
        <section id={id} className={`media-text-section room-type layout-${mediaAlignment} align-${mediaAlignment} row-lg h-pad`}>
          <div className="col-3-12_lg col-1">
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
                <PortableText value={roomLink.description} />
              </div>
            )}

            <div className="media-text-buttons">
              <a 
                href={`/rooms/${roomLink.slug}`}
                className="button button--cream"
              >
                View Room Details
              </a>

              {/* todo: add book room button */}
            </div>
          </div>

          <div className="col-3-12_lg dummy-col col-2"></div>

          <div className="col-6-12_lg col-3">
            {mediaType === 'image' && images && images.length > 0 && (
              <div className="media-wrap">
                {images.length === 1 ? (
                  <img 
                    data-src={urlFor(images[0]).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
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
            <div className="col-3-12_lg col-1">
              {heading && (
                <h4 className="media-text-heading">{heading}</h4>
              )}

              {body && body.length > 0 && (
                <>
                  <div className="media-text-body">
                    <PortableText value={body} />
                  </div>
                </>
              )}

              {buttons && buttons.length > 0 && (
                <div className={`media-text-buttons${buttons.length > 1 ? ' multiple-buttons' : ''}`}>
                  {buttons.map((button, index) => {
                    const linkInfo = getLinkInfo(button)
                    if (!linkInfo.text || !linkInfo.href) return null
                    return (
                      <a 
                        key={index}
                        href={linkInfo.href}
                        className={`button button--${button.color || 'cream'}`}
                        {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {linkInfo.text}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="col-3-12_lg dummy-col col-2"></div>

            <div className="col-6-12_lg col-3">
              {mediaType === 'image' && images && images.length > 0 && (
                <div className="media-wrap">
                  {images.length === 1 ? (
                    <img 
                      data-src={urlFor(images[0]).url()} 
                      alt="" 
                      className="lazy full-bleed-image"
                    />
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
                <div className="media-text-room-links-carousel">
                  <Splide
                    ref={splideRef}
                    options={{
                      type: 'slide',
                      perPage: 4,
                      perMove: 4,
                      gap: '20px',
                      pagination: false,
                      arrows: false,
                    }}
                  >
                    {roomLinks.map((room, index) => (
                      <SplideSlide key={index}>
                        <div className="media-text-link">
                          {room.image && (
                            <div className="media-wrap">
                              <img 
                                data-src={urlFor(room.image).url()} 
                                alt="" 
                                className="lazy full-bleed-image"
                              />

                              <div className="media-text-buttons">
                                <a 
                                  href={`/rooms/${room.slug}`}
                                  className="button button--cream"
                                >
                                  View Details
                                </a>

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
                              <PortableText value={room.description} />
                            </div>
                          )}
                        </div>
                      </SplideSlide>
                    ))}
                  </Splide>
                  <div className="media-text-room-links-carousel-controls">
                    <button 
                      className="carousel-arrow carousel-arrow--prev"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
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
                      disabled={currentPage === totalPages}
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
                      <div className="media-text-link">
                        {room.image && (
                          <div className="media-wrap">
                            <img 
                              data-src={urlFor(room.image).url()} 
                              alt="" 
                              className="lazy full-bleed-image"
                            />
                            <div className="loading-overlay" />

                            <div className="media-text-buttons">
                              <a 
                                href={`/rooms/${room.slug}`}
                                className="button button--cream"
                              >
                                View Details
                              </a>

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
                            <PortableText value={room.description} />
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
            <div className="col-3-12_lg col-1">
              {heading && (
                <h4 className="media-text-heading">{heading}</h4>
              )}

              {body && body.length > 0 && (
                <div className="media-text-body">
                  <PortableText value={body} />
                </div>
              )}

              {buttons && buttons.length > 0 && (
                <div className={`media-text-buttons${buttons.length > 1 ? ' multiple-buttons' : ''}`}>
                  {buttons.map((button, index) => {
                    const linkInfo = getLinkInfo(button)
                    if (!linkInfo.text || !linkInfo.href) return null
                    return (
                      <a 
                        key={index}
                        href={linkInfo.href}
                        className={`button button--${button.color || 'cream'}`}
                        {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {linkInfo.text}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="col-3-12_lg dummy-col col-2"></div>

            <div className="col-6-12_lg col-3">
              {mediaType === 'image' && images && images.length > 0 && (
                <div className="media-wrap">
                  {images.length === 1 ? (
                    <img 
                      data-src={urlFor(images[0]).url()} 
                      alt="" 
                      className="lazy full-bleed-image"
                    />
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
            <div className="row-lg">
              {links.map((link, index) => (
                <div key={index} className="col-6-12_lg">
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
                          <div className={`media-text-buttons${link.buttons.length > 1 ? ' multiple-buttons' : ''}`}>
                            {link.buttons.map((button, buttonIndex) => {
                              const linkInfo = getLinkInfo(button)
                              if (!linkInfo.text || !linkInfo.href) return null
                              return (
                                <a 
                                  key={buttonIndex}
                                  href={linkInfo.href}
                                  className={`button button--${button.color || 'cream'}`}
                                  {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                                >
                                  {linkInfo.text}
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {link.header && (
                      <h5 className="media-text-heading">{link.header}</h5>
                    )}

                    {link.description && (
                      <div className="media-text-body">
                        <PortableText value={link.description} />
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
