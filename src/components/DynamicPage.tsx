// src/components/DynamicPage.tsx
import React from 'react'
import { client } from '../../sanity.client'
import {
  pageQuery,
  activitiesQuery,
  linksQuery,
  calendarCountQuery,
  paginatedCalendarQuery,
} from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
import BodyClassProvider from './BodyClassProvider'
import FlexibleContent from './FlexibleContent'
import HeroSectionActivities from './HeroSectionActivities'
import HeroSectionLinks from './HeroSectionLinks'
import CalendarFilter from './CalendarFilter'
import LinksSection from './LinksSection'
import TextPage from './TextPage'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const page = await client.fetch(pageQuery, { slug })

  if (!page) {
    notFound()
  }

  // If this is a Calendar page, fetch the full calendar data and all calendar events
  if (page.pageType === 'calendar') {
    const perPage = 20
    const pageParam = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page
    const requestedPage = Number.parseInt(pageParam ?? '1', 10)
    const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

    const [calendarPageData, totalCount] = await Promise.all([
      client.fetch(activitiesQuery),
      client.fetch(calendarCountQuery),
    ])

    if (!calendarPageData) {
      notFound()
    }

    const totalPages = Math.max(Math.ceil((totalCount ?? 0) / perPage), 1)
    const safePage = Math.min(currentPage, totalPages)
    const offset = (safePage - 1) * perPage
    const end = offset + perPage

    const paginatedCalendarEvents = await client.fetch(paginatedCalendarQuery, { offset, end })

    const calendarSlug = page.slug?.current || slug
    const baseHref = `/${calendarSlug}`

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

        <FlexibleContent contentBlocks={page.contentBlocks || []} />

        {paginatedCalendarEvents && paginatedCalendarEvents.length > 0 && (
          <CalendarFilter
            activities={paginatedCalendarEvents}
            layout="4-activities"
            pagination={{ baseHref, currentPage: safePage, totalPages }}
          />
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
