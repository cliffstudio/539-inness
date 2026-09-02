import '@/styles/style.scss'
import { getFooterSettings, getMenu, getAnnouncementPopupSection } from '../../sanity/lib/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'
import OverflowController from '../../components/OverflowController'
import Providers from '../../components/Providers'
import BookingOverlay from '../../components/BookingOverlay'
import BasketDrawer from '../../components/BasketDrawer'
import AnnouncementPopupSection from '../../components/AnnouncementPopupSection'
import CookieConsent from '../../components/CookieConsent'
import GoogleTagManager from '../../components/GoogleTagManager'

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
    <Providers>
      <GoogleTagManager />
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
    </Providers>
  )
}
