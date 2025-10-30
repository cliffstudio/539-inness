import { client } from '../../../sanity.client'
import { homepageQuery } from '../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from '../../components/BodyClassProvider'
import HeroSectionHomepage from '../../components/HeroSectionHomepage'
import FlexibleContent from '../../components/FlexibleContent'

export const revalidate = 0

export default async function Home() {
  const page = await client.fetch(homepageQuery)
  
  if (!page) {
    notFound()
  }

  return (
    <>
      <BodyClassProvider 
        pageType={page.pageType} 
        slug={page.slug?.current} 
      />
      
      <HeroSectionHomepage 
        heading={page.heading}
        mediaType={page.mediaType}
        image={page.image}
        video={page.video}
        videoPlaceholder={page.videoPlaceholder}
      />
      
      <FlexibleContent contentBlocks={page.contentBlocks || []} />
    </>
  )
}
