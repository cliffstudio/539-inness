import '@/styles/style.scss'
import { getFooterSettings, getMenu } from '../../utils/footerSettings'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LazyLoadInitializer from '../../components/LazyLoadInitializer'
import MainWrapper from '../../components/MainWrapper'

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
      {menu && <Header menu={menu} />}
      <MainWrapper>{children}</MainWrapper>
      {footerSettings && <Footer footer={footerSettings} />}
    </>
  )
}
