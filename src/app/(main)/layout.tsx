import '@/styles/style.scss'
import { Suspense } from 'react'
import { getFooterSettings, getMenu, getAnnouncementPopupSection } from '../../utils/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'
import OverflowController from '../../components/OverflowController'
import { BookingProvider } from '../../contexts/BookingContext'
import BookingOverlay from '../../components/BookingOverlay'
import { BasketProvider } from '../../contexts/BasketContext'
import BasketDrawer from '../../components/BasketDrawer'
import AnnouncementPopupSection from '../../components/AnnouncementPopupSection'
import CookieConsent from '../../components/CookieConsent'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [footerSettings, menu, announcementPopupSection] = await Promise.all([
    getFooterSettings(),
    getMenu(),
    getAnnouncementPopupSection()
  ])

  return (
    <Suspense fallback={null}>
      <BookingProvider>
        <BasketProvider>
          <LazyLoadInitializer />
          <OverflowController />
          {menu && <Header menu={menu} />}
          <MainWrapper>{children}</MainWrapper>
          {footerSettings && <Footer footer={footerSettings} />}
          {announcementPopupSection && (
            <AnnouncementPopupSection 
              enabled={announcementPopupSection.enabled}
              slides={announcementPopupSection.slides}
            />
          )}
          <BookingOverlay />
          <BasketDrawer />
          <CookieConsent />
        </BasketProvider>
      </BookingProvider>
    </Suspense>
  )
}
