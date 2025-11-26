import '@/styles/style.scss'
import { Suspense } from 'react'
import { getFooterSettings, getMenu } from '../../utils/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'
import OverflowController from '../../components/OverflowController'
import { BookingProvider } from '../../contexts/BookingContext'
import BookingOverlay from '../../components/BookingOverlay'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [footerSettings, menu] = await Promise.all([
    getFooterSettings(),
    getMenu()
  ])

  return (
    <Suspense fallback={null}>
      <BookingProvider>
        <LazyLoadInitializer />
        <OverflowController />
        {menu && <Header menu={menu} />}
        <MainWrapper>{children}</MainWrapper>
        {footerSettings && <Footer footer={footerSettings} />}
        <BookingOverlay />
      </BookingProvider>
    </Suspense>
  )
}
