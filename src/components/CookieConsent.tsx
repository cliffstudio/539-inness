'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    cookieconsent: {
      initialise: (options: CookieConsentOptions) => void
    }
  }
}

interface CookieConsentOptions {
  type: string
  palette: {
    popup: {
      background: string
      text: string
    }
    button: {
      background: string
      text: string
    }
  }
  content: {
    message: string
    dismiss?: string
    allow?: string
    deny?: string
    link?: string
    href?: string
    policy?: string
  }
  compliance: {
    [key: string]: string
  }
}

export default function CookieConsent() {
  // Helper function to watch cookie window and manage overlay
  const setupCookieWindowWatcher = () => {
    // First, ensure classes are removed if no cookie window exists (e.g., after refresh when cookies already set)
    const checkAndCleanup = () => {
      const cookieWindow = document.querySelector('.cc-window') as HTMLElement
      if (!cookieWindow) {
        document.body.classList.remove('cc-window-visible', 'cc-window-fading')
        return false
      }
      return true
    }

    // Initial cleanup check
    checkAndCleanup()

    let observers: MutationObserver[] = []
    let buttonClickHandlers: Array<() => void> = []

    const watchCookieWindow = () => {
      const cookieWindow = document.querySelector('.cc-window') as HTMLElement
      
      if (!cookieWindow) {
        // No cookie window exists, ensure classes are removed
        document.body.classList.remove('cc-window-visible', 'cc-window-fading')
        return
      }

      // Check if window is actually visible (not hidden/faded)
      const computedStyle = window.getComputedStyle(cookieWindow)
      const opacity = parseFloat(computedStyle.opacity)
      const display = computedStyle.display
      const visibility = computedStyle.visibility

      // Only show overlay if window is actually visible
      if (opacity > 0.1 && display !== 'none' && visibility !== 'hidden' && 
          !cookieWindow.classList.contains('cc-fade-out') && 
          !cookieWindow.classList.contains('cc-invisible')) {
        document.body.classList.add('cc-window-visible')
        document.body.classList.remove('cc-window-fading')
      } else {
        document.body.classList.remove('cc-window-visible')
        document.body.classList.add('cc-window-fading')
      }

      // Clean up existing observers
      observers.forEach(obs => obs.disconnect())
      observers = []
      buttonClickHandlers.forEach(handler => handler())
      buttonClickHandlers = []

      // Watch for opacity and style changes
      const opacityObserver = new MutationObserver(() => {
        const currentWindow = document.querySelector('.cc-window') as HTMLElement
        if (!currentWindow) {
          document.body.classList.remove('cc-window-visible', 'cc-window-fading')
          return
        }

        const currentStyle = window.getComputedStyle(currentWindow)
        const currentOpacity = parseFloat(currentStyle.opacity)
        const currentDisplay = currentStyle.display
        const currentVisibility = currentStyle.visibility

        if (currentOpacity < 0.1 || currentDisplay === 'none' || currentVisibility === 'hidden' ||
            currentWindow.classList.contains('cc-fade-out') || 
            currentWindow.classList.contains('cc-invisible')) {
          document.body.classList.remove('cc-window-visible')
          document.body.classList.add('cc-window-fading')
        } else if (currentOpacity > 0.9) {
          document.body.classList.add('cc-window-visible')
          document.body.classList.remove('cc-window-fading')
        }
      })

      // Watch for class changes
      const classObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement
            if (target.classList.contains('cc-fade-out') || target.classList.contains('cc-invisible')) {
              document.body.classList.remove('cc-window-visible')
              document.body.classList.add('cc-window-fading')
            } else if (!target.classList.contains('cc-fade-out') && !target.classList.contains('cc-invisible')) {
              // Window became visible again
              const style = window.getComputedStyle(target)
              if (parseFloat(style.opacity) > 0.1) {
                document.body.classList.add('cc-window-visible')
                document.body.classList.remove('cc-window-fading')
              }
            }
          }
        })
      })

      // Watch for when window is removed from DOM
      const removalObserver = new MutationObserver(() => {
        if (!document.querySelector('.cc-window')) {
          document.body.classList.remove('cc-window-visible', 'cc-window-fading')
        }
      })

      opacityObserver.observe(cookieWindow, { attributes: true, attributeFilter: ['style', 'class'] })
      classObserver.observe(cookieWindow, { attributes: true, attributeFilter: ['class'] })
      removalObserver.observe(document.body, { childList: true, subtree: true })

      observers.push(opacityObserver, classObserver, removalObserver)

      // Watch for button clicks
      const buttons = cookieWindow.querySelectorAll('.cc-btn')
      buttons.forEach((button) => {
        const clickHandler = () => {
          // Trigger fade immediately on click
          setTimeout(() => {
            document.body.classList.remove('cc-window-visible')
            document.body.classList.add('cc-window-fading')
          }, 50)
        }
        button.addEventListener('click', clickHandler)
        buttonClickHandlers.push(() => button.removeEventListener('click', clickHandler))
      })
    }

    // Check for cookie window after initialization
    setTimeout(() => {
      checkAndCleanup()
      watchCookieWindow()
    }, 100)

    // Continuously watch for cookie window appearance/disappearance
    const checkInterval = setInterval(() => {
      if (checkAndCleanup()) {
        watchCookieWindow()
      }
    }, 200)

    // Cleanup after 30 seconds (cookie window should appear quickly if it's going to)
    setTimeout(() => clearInterval(checkInterval), 30000)
  }

  // Clean up any leftover classes on mount (e.g., after refresh)
  useEffect(() => {
    // Immediately check if cookie window exists and clean up if not
    if (typeof window !== 'undefined') {
      const cookieWindow = document.querySelector('.cc-window')
      if (!cookieWindow) {
        document.body.classList.remove('cc-window-visible', 'cc-window-fading')
      }
    }
  }, [])

  useEffect(() => {
    // Initialize cookie consent when the library is loaded
    const initCookieConsent = () => {
      if (typeof window !== 'undefined' && window.cookieconsent) {
        window.cookieconsent.initialise({
          type: 'opt-in',
          palette: {
            popup: {
              background: '#505050',
              text: '#ffffff'
            },
            button: {
              background: '#505050',
              text: '#ffffff'
            }
          },
          content: {
            message: 'This site uses cookies.',
            allow: 'Accept',
            deny: 'Decline',
            link: '',
            href: ''
          },
          compliance: {
            'opt-in': '<div class="cc-compliance"><a aria-label="allow cookies" tabindex="0" class="cc-btn cc-allow">Accept</a><a aria-label="deny cookies" tabindex="0" class="cc-btn cc-deny">Decline</a><a class="cookies-link" href="/cookie-policy">Cookie Policy</a></div>'
          }
        })

        setupCookieWindowWatcher()
      }
    }

    // Check if library is already loaded
    if (window.cookieconsent) {
      initCookieConsent()
    }
  }, [])

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && window.cookieconsent) {
      window.cookieconsent.initialise({
        type: 'opt-in',
        palette: {
          popup: {
            background: '#505050',
            text: '#ffffff'
          },
          button: {
            background: '#505050',
            text: '#ffffff'
          }
        },
        content: {
          message: 'This site uses cookies.',
          allow: 'Accept',
          deny: 'Decline',
          link: '',
          href: ''
        },
        compliance: {
          'opt-in': '<div class="cc-compliance"><a aria-label="allow cookies" tabindex="0" class="cc-btn cc-allow">Accept</a><a aria-label="deny cookies" tabindex="0" class="cc-btn cc-deny">Decline</a><a class="cookies-link" href="/cookie-policy" target="_blank">Cookie Policy</a></div>'
        }
      })

      setupCookieWindowWatcher()
    }
  }

  return (
    <>
      {/* Cookie Consent CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css"
      />
      {/* Cookie Consent JS */}
      <Script
        src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
    </>
  )
}

