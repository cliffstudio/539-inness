// src/components/DynamicPage.tsx
import React from 'react'
import { client } from '../../sanity.client'
import { pageQuery, activitiesQuery, allActivitiesQuery } from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from './BodyClassProvider'
import FlexibleContent from './FlexibleContent'
import HeroSectionActivities from './HeroSectionActivities'
import ActivityFilter from './ActivityFilter'

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
