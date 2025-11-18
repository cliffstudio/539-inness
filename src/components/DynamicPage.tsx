// src/components/DynamicPage.tsx
import React from 'react'
import { client } from '../../sanity.client'
import { pageQuery, activitiesQuery, allActivitiesQuery, linksQuery, activityQuery, shopQuery, shopPostsQuery } from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from './BodyClassProvider'
import FlexibleContent from './FlexibleContent'
import HeroSectionActivities from './HeroSectionActivities'
import Hero from './HeroSectionShop'
import HeroSectionLinks from './HeroSectionLinks'
import ActivityFilter from './ActivityFilter'
import ShopFilter from './ShopFilter'
import LinksSection from './LinksSection'
import ActivityPage from './ActivityPage'
import TextPage from './TextPage'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const isActivityDetail = slug.startsWith('activities/')

  if (isActivityDetail) {
    const activitySlug = slug.replace(/^activities\//, '')

    if (!activitySlug) {
      notFound()
    }

    const activity = await client.fetch(activityQuery, { slug: activitySlug })

    if (!activity) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType="activity" 
          slug={slug} 
        />
        <ActivityPage {...activity} />
      </>
    )
  }

  const page = await client.fetch(pageQuery, { slug })

  if (!page) {
    notFound()
  }

  // If this is an Activities page, fetch the full activities data and all activities
  if (page.pageType === 'activities') {
    const [activitiesPage, allActivities] = await Promise.all([
      client.fetch(activitiesQuery),
      client.fetch(allActivitiesQuery)
    ])

    if (!activitiesPage) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        
        <HeroSectionActivities 
          activitiesHeading={activitiesPage.activitiesHeading}
          activitiesBody={activitiesPage.activitiesBody}
          activitiesImage={activitiesPage.activitiesImage}
        />

        {allActivities && allActivities.length > 0 && (
          <ActivityFilter activities={allActivities} layout="4-activities" />
        )}
      </>
    )
  }

  // If this is a Shop page, fetch the full shop data and all shops
  if (page.pageType === 'shop') {
    const [shopPage, allShops] = await Promise.all([
      client.fetch(shopQuery),
      client.fetch(shopPostsQuery)
    ])

    if (!shopPage) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        
        <Hero 
          shopHeading={shopPage.shopHeading}
          shopBody={shopPage.shopBody}
          shopImage={shopPage.shopImage}
        />

        {allShops && allShops.length > 0 && (
          <ShopFilter shops={allShops} layout="4-shops" />
        )}

        {shopPage.contentBlocks && shopPage.contentBlocks.length > 0 && (
          <FlexibleContent contentBlocks={shopPage.contentBlocks} />
        )}
      </>
    )
  }

  // If this is a Links page, fetch the full links data
  if (page.pageType === 'links') {
    const linksPage = await client.fetch(linksQuery, { slug: resolvedParams.slug })

    if (!linksPage) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        
        <HeroSectionLinks 
          heading={linksPage.heading}
          body={linksPage.body}
          image={linksPage.image}
        />

        {linksPage.links && linksPage.links.length > 0 && (
          <LinksSection links={linksPage.links} />
        )}
      </>
    )
  }

  if (page.pageType === 'text') {
    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />

        <TextPage title={page.title} textBlocks={page.textBlocks} />
      </>
    )
  }

  // Regular page with flexible content
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
