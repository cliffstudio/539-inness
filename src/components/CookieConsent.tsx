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
            'opt-in': '<div class="cc-compliance"><a aria-label="allow cookies" tabindex="0" class="cc-btn cc-allow">Accept</a><a aria-label="deny cookies" tabindex="0" class="cc-btn cc-deny">Decline</a><a class="cookies-link" href="/cookies">Cookie Policy</a></div>'
          }
        })
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
          'opt-in': '<div class="cc-compliance"><a aria-label="allow cookies" tabindex="0" class="cc-btn cc-allow">Accept</a><a aria-label="deny cookies" tabindex="0" class="cc-btn cc-deny">Decline</a><a class="cookies-link" href="/cookies" target="_blank">Cookie Policy</a></div>'
        }
      })
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

