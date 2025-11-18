import '@/styles/style.scss'
import { getFooterSettings, getMenu } from '../../utils/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'
import OverflowController from '../../components/OverflowController'

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
    <>
      <LazyLoadInitializer />
      <OverflowController />
      {menu && <Header menu={menu} />}
      <MainWrapper>{children}</MainWrapper>
      {footerSettings && <Footer footer={footerSettings} />}
    </>
  )
}
