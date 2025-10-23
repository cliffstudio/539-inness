import { client } from '../../../sanity.client'
import { homepageQuery } from '../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from '../../components/BodyClassProvider'
import FlexibleContent from '../../components/FlexibleContent'

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
      
      <FlexibleContent contentBlocks={page.contentBlocks || []} />
    </>
  )
}
