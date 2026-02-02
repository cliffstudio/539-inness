'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import flatpickr from 'flatpickr'
import type { Instance } from 'flatpickr/dist/types/instance'
import 'flatpickr/dist/flatpickr.min.css'
import { formatDateForNamastay } from '../utils/namastay'

interface BookingSectionProps {
  noTopPad?: boolean
  noBottomPad?: boolean
}

// Format date for display (e.g., "17 Dec 25")
const formatDateDisplay = (date: Date | string): string => {
  if (!date) return ''
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  const day = dateObj.getDate()
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const year = dateObj.getFullYear().toString().slice(-2)
  return `${day} ${month} ${year}`
}

export default function BookingSection({ noTopPad = false, noBottomPad = false }: BookingSectionProps) {
  const [adultCount, setAdultCount] = useState(2)
  const [childCount, setChildCount] = useState(0)
  const [checkInDate, setCheckInDate] = useState<string>('')
  const [checkOutDate, setCheckOutDate] = useState<string>('')
  const [isGuestPopupOpen, setIsGuestPopupOpen] = useState(false)
  const [isUnifiedPopupOpen, setIsUnifiedPopupOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [checkInDisplay, setCheckInDisplay] = useState('Arrive')
  const [checkOutDisplay, setCheckOutDisplay] = useState('Depart')
  
  const bookingFormRef = useRef<HTMLFormElement>(null)
  const guestWrapperRef = useRef<HTMLDivElement>(null)
  const guestPopupRef = useRef<HTMLDivElement>(null)
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const startInputRef = useRef<HTMLInputElement>(null)
  const startWrapperRef = useRef<HTMLDivElement>(null)
  const unifiedPopupRef = useRef<HTMLDivElement>(null)
  const unifiedPopupGuestRef = useRef<HTMLDivElement>(null)
  const flatpickrInstanceRef = useRef<Instance | null>(null)

  // Check if mobile and update state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle guest picker click
  const handleGuestPickerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMobileView) {
      // Mobile: toggle both guest popup and calendar
      // Since we always open/close them together, use guest popup state as source of truth
      if (isGuestPopupOpen) {
        // Close both
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
        // Manually hide calendar on mobile since it uses static positioning
        setTimeout(() => {
          const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
          if (calendar) {
            calendar.style.display = 'none'
            calendar.style.visibility = 'hidden'
            calendar.style.opacity = '0'
          }
        }, 10)
      } else {
        // Open both
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
          setTimeout(() => {
            const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
            if (calendar) {
              calendar.style.display = 'block'
              calendar.style.visibility = 'visible'
              calendar.style.opacity = '1'
            }
          }, 50)
        }
      }
    } else {
      // Desktop: toggle unified popup
      if (isUnifiedPopupOpen) {
        // Close if already open
        setIsUnifiedPopupOpen(false)
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
      } else {
        // Open if closed
        setIsUnifiedPopupOpen(true)
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
        }
      }
    }
  }

  // Update unified popup position based on booking form height
  const updateUnifiedPopupPosition = () => {
    if (bookingFormRef.current && unifiedPopupRef.current && !isMobileView) {
      const formRect = bookingFormRef.current.getBoundingClientRect()
      const formWrapper = bookingFormRef.current.closest('.booking-section')
      if (formWrapper) {
        const wrapperRect = formWrapper.getBoundingClientRect()
        const topPosition = formRect.bottom - wrapperRect.top
        unifiedPopupRef.current.style.top = `${topPosition}px`
      }
    }
  }

  // Update guest popup position based on booking form height (for mobile)
  const updateGuestPopupPosition = () => {
    if (bookingFormRef.current && guestWrapperRef.current && guestPopupRef.current && isMobileView) {
      const formRect = bookingFormRef.current.getBoundingClientRect()
      const wrapperRect = guestWrapperRef.current.getBoundingClientRect()
      const topPosition = formRect.bottom - wrapperRect.top
      guestPopupRef.current.style.top = `${topPosition}px`
    }
  }

  // Set popup position when it opens or when form height changes
  useEffect(() => {
    if (isUnifiedPopupOpen && !isMobileView) {
      updateUnifiedPopupPosition()
      // Move calendar into unified popup guest section when it opens
      setTimeout(() => {
        const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
        const guestSection = unifiedPopupGuestRef.current
        if (calendar && guestSection && !guestSection.contains(calendar)) {
          guestSection.appendChild(calendar)
        }
      }, 50)
    }
    if (isGuestPopupOpen && isMobileView) {
      updateGuestPopupPosition()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnifiedPopupOpen, isGuestPopupOpen, isMobileView])

  // Update popup position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isUnifiedPopupOpen && !isMobileView) {
        updateUnifiedPopupPosition()
      }
      if (isGuestPopupOpen && isMobileView) {
        updateGuestPopupPosition()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnifiedPopupOpen, isGuestPopupOpen, isMobileView])

  // Handle guest count changes
  const handleGuestChange = (type: 'adult' | 'child', delta: number) => {
    if (type === 'adult') {
      setAdultCount(Math.max(1, adultCount + delta))
    } else {
      setChildCount(Math.max(0, childCount + delta))
    }
  }

  // Initialize Flatpickr date range picker
  useEffect(() => {
    if (!startInputRef.current || !startWrapperRef.current) return

    // Update custom display for date inputs (defined inside useEffect to avoid dependency issues)
    const updateCustomDisplay = (inputId: string, displayId: string, date: Date | string) => {
      const displayElement = document.getElementById(displayId)
      if (displayElement) {
        const h5Element = displayElement.querySelector('h5')
        if (h5Element) {
          const formatted = formatDateDisplay(date)
          h5Element.textContent = formatted || (inputId === 'start' ? 'Arrive' : 'Depart')
        }
      }
    }

    const today = new Date()
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)

    // Set default dates
    const defaultStartDate = formatDateForNamastay(today)
    const defaultEndDate = formatDateForNamastay(threeDaysLater)
    setCheckInDate(defaultStartDate)
    setCheckOutDate(defaultEndDate)
    setCheckInDisplay(formatDateDisplay(today))
    setCheckOutDisplay(formatDateDisplay(threeDaysLater))

    // Make sure input is accessible to Flatpickr
    const input = startInputRef.current
    // Flatpickr needs the input to be accessible, so we'll style it to be invisible but functional
    // Keep pointer-events enabled so Flatpickr can attach event handlers
    input.style.position = 'absolute'
    input.style.opacity = '0'
    input.style.width = '1px'
    input.style.height = '1px'
    input.style.pointerEvents = 'auto'
    input.style.cursor = 'pointer'

    // Initialize Flatpickr
    // Check if mobile to show 1 month instead of 2
    const checkMobile = window.innerWidth <= 768
    
    const fp = flatpickr(input, {
      mode: 'range',
      defaultDate: [today, threeDaysLater],
      minDate: today,
      showMonths: checkMobile ? 1 : 2,
      monthSelectorType: 'static', // Use text month display instead of dropdown on mobile
      locale: {
        weekdays: {
          shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        }
      },
      appendTo: startWrapperRef.current || document.body,
      static: false,
      clickOpens: false, // We'll control opening manually
      onReady: function () {
        updateCustomDisplay('start', 'start-display', today)
        updateCustomDisplay('end', 'end-display', threeDaysLater)
      },
      onOpen: function(selectedDates, dateStr, instance) {
        setTimeout(function() {
          if (bookingFormRef.current && instance.calendarContainer && startWrapperRef.current) {
            const calendarContainer = instance.calendarContainer as HTMLElement
            
            // Ensure calendar is visible
            calendarContainer.style.display = 'block'
            calendarContainer.style.visibility = 'visible'
            calendarContainer.style.opacity = '1'
            
            // Check if mobile (max-width: 820px)
            const isMobileCheck = window.innerWidth <= 768
            
            if (isMobileCheck) {
              // On mobile, use static positioning for inline display
              calendarContainer.style.position = 'static'
              calendarContainer.style.top = 'auto'
              calendarContainer.style.left = 'auto'
              calendarContainer.style.right = 'auto'
              calendarContainer.style.zIndex = 'auto'
            } else {
              // On desktop, move calendar into unified popup guest section if it exists
              const guestSection = document.querySelector('.unified-popup__guest')
              if (guestSection && !guestSection.contains(calendarContainer)) {
                guestSection.appendChild(calendarContainer)
              }
              // Calendar will be positioned within unified popup
              calendarContainer.style.position = 'relative'
              calendarContainer.style.top = 'auto'
              calendarContainer.style.left = 'auto'
              calendarContainer.style.right = 'auto'
              calendarContainer.style.zIndex = 'auto'
            }
          }
        }, 10)
      },
      onChange: function (selectedDates) {
        if (selectedDates.length === 2) {
          const startDate = selectedDates[0]
          const endDate = selectedDates[1]
          
          const startDateStr = formatDateForNamastay(startDate)
          const endDateStr = formatDateForNamastay(endDate)
          
          setCheckInDate(startDateStr)
          setCheckOutDate(endDateStr)
          updateCustomDisplay('start', 'start-display', startDate)
          updateCustomDisplay('end', 'end-display', endDate)
        } else if (selectedDates.length === 1) {
          const startDate = selectedDates[0]
          const startDateStr = formatDateForNamastay(startDate)
          
          setCheckInDate(startDateStr)
          updateCustomDisplay('start', 'start-display', startDate)
          
          // Suggest end date three days after start date
          const suggestedEndDate = new Date(startDate)
          suggestedEndDate.setDate(suggestedEndDate.getDate() + 3)
          
          // Only update the display to show suggested date
          updateCustomDisplay('end', 'end-display', suggestedEndDate)
        }
      }
    })

    flatpickrInstanceRef.current = fp

    return () => {
      if (fp) {
        fp.destroy()
  }
    }
  }, [])

  // Handle date input wrapper clicks to trigger date picker
  const handleStartWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMobileView) {
      // Mobile: toggle both calendar and guest popup
      // Since we always open/close them together, use guest popup state as source of truth
      if (isGuestPopupOpen) {
        // Close both
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
        // Manually hide calendar on mobile since it uses static positioning
        setTimeout(() => {
          const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
          if (calendar) {
            calendar.style.display = 'none'
            calendar.style.visibility = 'hidden'
            calendar.style.opacity = '0'
          }
        }, 10)
      } else {
        // Open both
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
          setTimeout(() => {
            const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
            if (calendar) {
              calendar.style.display = 'block'
              calendar.style.visibility = 'visible'
              calendar.style.opacity = '1'
            }
          }, 50)
        }
      }
    } else {
      // Desktop: toggle unified popup
      if (isUnifiedPopupOpen) {
        // Close if already open
        setIsUnifiedPopupOpen(false)
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
      } else {
        // Open if closed
        setIsUnifiedPopupOpen(true)
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
        }
      }
    }
  }

  const handleEndWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMobileView) {
      // Mobile: toggle both calendar and guest popup
      // Since we always open/close them together, use guest popup state as source of truth
      if (isGuestPopupOpen) {
        // Close both
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
        // Manually hide calendar on mobile since it uses static positioning
        setTimeout(() => {
          const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
          if (calendar) {
            calendar.style.display = 'none'
            calendar.style.visibility = 'hidden'
            calendar.style.opacity = '0'
          }
        }, 10)
      } else {
        // Open both
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
          setTimeout(() => {
            const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
            if (calendar) {
              calendar.style.display = 'block'
              calendar.style.visibility = 'visible'
              calendar.style.opacity = '1'
            }
          }, 50)
        }
      }
    } else {
      // Desktop: toggle unified popup
      if (isUnifiedPopupOpen) {
        // Close if already open
        setIsUnifiedPopupOpen(false)
        setIsGuestPopupOpen(false)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.close()
        }
      } else {
        // Open if closed
        setIsUnifiedPopupOpen(true)
        setIsGuestPopupOpen(true)
        if (flatpickrInstanceRef.current) {
          flatpickrInstanceRef.current.open()
        }
      }
    }
  }

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileView) {
        // Mobile: close guest popup and calendar
        const target = event.target as Node
        const isClickInsideGuestPopup = guestPopupRef.current?.contains(target)
        const isClickInsideGuestPicker = guestPickerRef.current?.contains(target)
        const isClickInsideDateInputs = 
          startWrapperRef.current?.contains(target) ||
          document.getElementById('end-display')?.contains(target)
        const isClickInsideCalendar = (event.target as Element)?.closest('.flatpickr-calendar')
        
        if (
          !isClickInsideGuestPopup &&
          !isClickInsideGuestPicker &&
          !isClickInsideDateInputs &&
          !isClickInsideCalendar
        ) {
          setIsGuestPopupOpen(false)
          if (flatpickrInstanceRef.current) {
            flatpickrInstanceRef.current.close()
          }
          // Manually hide calendar on mobile since it uses static positioning
          setTimeout(() => {
            const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
            if (calendar) {
              calendar.style.display = 'none'
              calendar.style.visibility = 'hidden'
              calendar.style.opacity = '0'
            }
          }, 10)
        }
      } else {
        // Desktop: close unified popup
        const target = event.target as Node
        const isClickInsideUnifiedPopup = unifiedPopupRef.current?.contains(target)
        const isClickInsideGuestPicker = guestPickerRef.current?.contains(target)
        const isClickInsideDateInputs = 
          startWrapperRef.current?.contains(target) ||
          document.getElementById('end-display')?.contains(target)
        const isClickInsideCalendar = (event.target as Element)?.closest('.flatpickr-calendar')
        
        if (
          !isClickInsideUnifiedPopup &&
          !isClickInsideGuestPicker &&
          !isClickInsideDateInputs &&
          !isClickInsideCalendar
        ) {
          setIsUnifiedPopupOpen(false)
          setIsGuestPopupOpen(false)
          if (flatpickrInstanceRef.current) {
            flatpickrInstanceRef.current.close()
          }
        }
      }
    }

    if (isGuestPopupOpen || isUnifiedPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isGuestPopupOpen, isUnifiedPopupOpen, isMobileView])

  // Handle close popup button click
  const handleClosePopup = () => {
    if (isMobileView) {
      setIsGuestPopupOpen(false)
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.close()
      }
      // Manually hide calendar on mobile since it uses static positioning
      setTimeout(() => {
        const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement
        if (calendar) {
          calendar.style.display = 'none'
          calendar.style.visibility = 'hidden'
          calendar.style.opacity = '0'
        }
      }, 10)
    } else {
      setIsUnifiedPopupOpen(false)
      setIsGuestPopupOpen(false)
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.close()
      }
    }
  }

  // Build initial offer data for the button (used in JSX and updated dynamically)
  const buildOfferData = useCallback(() => {
    const offerData: {
      apiKey: string
      startDate?: string
      endDate?: string
      adult?: number
      child?: number
      rooms?: number
    } = {
      apiKey: '6e1a1ee72c854f43b9bcb4113572e824nuuwro4cfvmrd62b',
      rooms: 2,
    }

    // Add dates if they are set
    if (checkInDate) {
      offerData.startDate = checkInDate
    }
    if (checkOutDate) {
      offerData.endDate = checkOutDate
    }

    // Add guest counts
    if (adultCount > 0) {
      offerData.adult = adultCount
    }
    if (childCount > 0) {
      offerData.child = childCount
    }

    return offerData
  }, [adultCount, childCount, checkInDate, checkOutDate])

  // Handle button click - update hidden button and trigger it
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    // Get the hidden button that the SDK detected during initialization
    const hiddenButton = document.getElementById('namastay-trigger-button') as HTMLButtonElement
    
    if (hiddenButton) {
      // Update the hidden button's data-offer with our form values
      const offerData = buildOfferData()
      const offerJson = JSON.stringify(offerData)
      hiddenButton.setAttribute('data-offer', offerJson)
      
      // Small delay to ensure attribute is set, then trigger the button
      setTimeout(() => {
        hiddenButton.click()
      }, 50)
    } else {
      console.error('Namastay hidden button not found')
    }
  }


  // Handle form submission - prevent default form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // The SDK will handle the button click automatically
  }

  // Calculate total guests for display
  const adultText = adultCount === 1 ? '1 Adult' : `${adultCount} Adults`
  const childText = childCount === 1 ? '1 Child' : `${childCount} Children`
  const guestDisplayText = childCount > 0 
    ? `${adultText} / ${childText}`
    : adultText

  const className = [
    'booking-section',
    'h-pad',
    'out-of-opacity',
    noTopPad ? 'no-top-pad' : '',
    noBottomPad ? 'no-bottom-pad' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <form ref={bookingFormRef} className="booking-form" onSubmit={handleSubmit}>
        <div className="guest-wrapper" ref={guestWrapperRef}>
          <div 
            id="guest-picker" 
            ref={guestPickerRef}
            onClick={handleGuestPickerClick}
          >
            <div>Guests</div>
            <h5>{guestDisplayText}</h5>
          </div>

          {/* Mobile: standalone guest popup */}
          <div 
            id="guest-popup" 
            ref={guestPopupRef}
            className={`popup${isGuestPopupOpen && isMobileView ? '' : ' hidden'}`}
          >
            <div className="guest-control">
              <div>Adults</div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="minus button" 
                  onClick={() => handleGuestChange('adult', -1)}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="adult-count" 
                  value={adultCount} 
                  readOnly 
                />
                <button 
                  type="button" 
                  className="plus button" 
                  onClick={() => handleGuestChange('adult', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="guest-control">
              <div>Children</div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="minus button" 
                  onClick={() => handleGuestChange('child', -1)}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="child-count" 
                  value={childCount} 
                  readOnly 
                />
                <button 
                  type="button" 
                  className="plus button" 
                  onClick={() => handleGuestChange('child', 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              type="button" 
              id="close-popup" 
              className="button button--orange"
              onClick={handleClosePopup}
            >
              Done
            </button>
          </div>
        </div>

        <div className="start-wrapper" ref={startWrapperRef}>
          <div 
            className="date-input" 
            id="start-display"
            onClick={handleStartWrapperClick}
          >
            <div>Arrive</div>
            <h5>{checkInDisplay}</h5>
          </div>

          <input 
            ref={startInputRef}
            type="text" 
            id="start" 
            name="start" 
            required 
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="end-wrapper">
          <div 
            className="date-input" 
            id="end-display"
            onClick={handleEndWrapperClick}
          >
            <div>Depart</div>
            <h5>{checkOutDisplay}</h5>
          </div>
        </div>

        <button 
          className="namastay-offer-button button button--orange"
          type="button"
          data-offer={JSON.stringify(buildOfferData())}
          onClick={handleButtonClick}
        >
          Check Availability
        </button>

        <div className="namastay-widget-button"></div>
      </form>

      {/* Desktop: unified popup containing both guest popup and calendar */}
      {!isMobileView && (
        <div 
          ref={unifiedPopupRef}
          className={`unified-popup h-pad${isUnifiedPopupOpen ? '' : ' hidden'}`}
        >
          <div className="unified-popup__guest" ref={unifiedPopupGuestRef}>
            <div className="popup">
              <div className="guest-control">
                <div>Adults</div>

                <div className="button-group">
                  <button 
                    type="button" 
                    className="minus button" 
                    onClick={() => handleGuestChange('adult', -1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="adult-count-unified" 
                    value={adultCount} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    className="plus button" 
                    onClick={() => handleGuestChange('adult', 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="guest-control">
                <div>Children</div>

                <div className="button-group">
                  <button 
                    type="button" 
                    className="minus button" 
                    onClick={() => handleGuestChange('child', -1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="child-count-unified" 
                    value={childCount} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    className="plus button" 
                    onClick={() => handleGuestChange('child', 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}