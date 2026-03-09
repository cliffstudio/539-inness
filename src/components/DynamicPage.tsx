// src/components/DynamicPage.tsx
import React from 'react'
import { client } from '../../sanity.client'
import { pageQuery, activitiesQuery, allCalendarQuery, linksQuery, calendarQuery } from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from './BodyClassProvider'
import FlexibleContent from './FlexibleContent'
import HeroSectionActivities from './HeroSectionActivities'
import HeroSectionLinks from './HeroSectionLinks'
import ActivityFilter from './ActivityFilter'
import LinksSection from './LinksSection'
import ActivityPage from './CalendarPage'
import TextPage from './TextPage'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const isActivityDetail = slug.startsWith('calendar/')

  if (isActivityDetail) {
    const calendarSlug = slug.replace(/^calendar\//, '')

    if (!calendarSlug) {
      notFound()
    }

    const calendarEvent = await client.fetch(calendarQuery, { slug: calendarSlug })

    if (!calendarEvent) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType="calendar" 
          slug={slug} 
        />
        <ActivityPage {...calendarEvent} />
      </>
    )
  }

  const page = await client.fetch(pageQuery, { slug })

  if (!page) {
    notFound()
  }

  // If this is a Calendar page, fetch the full calendar data and all calendar events
  if (page.pageType === 'calendar') {
    const [calendarPageData, allCalendarEvents] = await Promise.all([
      client.fetch(activitiesQuery),
      client.fetch(allCalendarQuery)
    ])

    if (!calendarPageData) {
      notFound()
    }

    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        
        <HeroSectionActivities 
          calendarHeading={calendarPageData.calendarHeading}
          calendarBody={calendarPageData.calendarBody}
          calendarMediaType={calendarPageData.calendarMediaType}
          calendarImages={calendarPageData.calendarImages}
          calendarVideo={calendarPageData.calendarVideo}
        />

        {allCalendarEvents && allCalendarEvents.length > 0 && (
          <ActivityFilter activities={allCalendarEvents} layout="4-activities" />
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
          mediaType={linksPage.mediaType}
          images={linksPage.images}
          video={linksPage.video}
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
