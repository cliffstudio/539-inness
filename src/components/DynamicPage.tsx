// src/components/DynamicPage.tsx
import React from 'react'
import { client } from '../../sanity.client'
import { pageQuery } from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
// import { SanityImage, SanityVideo, PortableTextBlock } from '../types/sanity'
import BodyClassProvider from './BodyClassProvider'
import FlexibleContent from './FlexibleContent'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  const page = await client.fetch(pageQuery, { slug: resolvedParams.slug })

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
