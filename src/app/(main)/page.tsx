import { client } from '../../../sanity.client'
import type { Metadata } from 'next'
import { homepageQuery, siteSettingsQuery } from '../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from '../../components/BodyClassProvider'
import HeroSectionHomepage from '../../components/HeroSectionHomepage'
import FlexibleContent from '../../components/FlexibleContent'
import { buildPageMetadata } from '../../sanity/lib/metadata'
import { urlFor } from '../../sanity/utils/imageUrlBuilder'
// import HomepageLoader from '../../components/HomepageLoader'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const [page, siteSettings] = await Promise.all([
    client.fetch(homepageQuery),
    client.fetch(siteSettingsQuery),
  ])

  if (!page) {
    return {}
  }

  return buildPageMetadata({
    pageTitle: page.title,
    seo: page.seo,
    siteSettings,
    buildImageUrl: (image) => urlFor(image).width(1200).height(630).url(),
  })
}

export default async function Home() {
  const page = await client.fetch(homepageQuery)
  
  if (!page) {
    notFound()
  }

  return (
    <>
      {/* <HomepageLoader /> */}
      <BodyClassProvider 
        pageType={page.pageType} 
        slug={page.slug?.current} 
      />
      
      <HeroSectionHomepage 
        homepageHeading={page.homepageHeading}
        homepageMediaType={page.homepageMediaType}
        homepageImages={page.homepageImages || []}
        homepageVideo={page.homepageVideo}
      />
      
      <FlexibleContent contentBlocks={page.contentBlocks || []} />
    </>
  )
}
