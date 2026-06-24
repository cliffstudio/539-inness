'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { initNamastay, NAMASTAY_HOTEL_PARAMETERS } from '../utils/namastay'

const MAX_RETRIES = 20
const RETRY_INTERVAL_MS = 200

export default function NamastayInit() {
  useEffect(() => {
    let retryCount = 0
    let timeoutId: ReturnType<typeof setTimeout>

    function tryInitialize() {
      if (typeof window.initNamastay === 'function') {
        initNamastay(NAMASTAY_HOTEL_PARAMETERS)
        return
      }

      if (retryCount >= MAX_RETRIES) {
        console.log(`⚠️ Namastay SDK failed to load after ${MAX_RETRIES} attempts`)
        return
      }

      retryCount++
      timeoutId = setTimeout(tryInitialize, RETRY_INTERVAL_MS)
    }

    tryInitialize()

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <Script
      id="namastay-script"
      src="https://sdk.namastay.io/index.js"
      strategy="afterInteractive"
    />
  )
}
