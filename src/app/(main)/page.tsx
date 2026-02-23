import { client } from '../../../sanity.client'
import { homepageQuery } from '../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from '../../components/BodyClassProvider'
import HeroSectionHomepage from '../../components/HeroSectionHomepage'
import FlexibleContent from '../../components/FlexibleContent'
// import HomepageLoader from '../../components/HomepageLoader'

export const revalidate = 0

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
        homepageImage={page.homepageImage}
        homepageVideo={page.homepageVideo}
      />
      
      <FlexibleContent contentBlocks={page.contentBlocks || []} />
    </>
  )
}
