// src/app/(main)/[...slug]/page.tsx
import DynamicPage from '../../../components/DynamicPage'
import type { Metadata } from 'next'
import { client } from '../../../../sanity.client'
import { pageSeoQuery, pageSlugsQuery, siteSettingsQuery } from '../../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '../../../sanity/lib/metadata'
import { urlFor } from '../../../sanity/utils/imageUrlBuilder'

export const revalidate = 0

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateStaticParams() {
  const pages = await client.fetch(pageSlugsQuery)

  const pageParams = pages
    .filter((page: { slug: { current: string } }) => {
      const isRoomPost = page.slug.current.startsWith('rooms/') && page.slug.current !== 'rooms'
      const isProduct = page.slug.current.startsWith('products/') && page.slug.current !== 'products'
      return !isRoomPost && !isProduct
    })
    .map((page: { slug: { current: string } }) => ({
      slug: page.slug.current.split('/'),
    }))

  return pageParams
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')

  const [page, siteSettings] = await Promise.all([
    client.fetch(pageSeoQuery, { slug }),
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

export default async function Page({ params, searchParams }: PageProps) {
  // Convert array to string for the slug
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  const resolvedSearchParams = (await searchParams) ?? {}
  
  // Check if this is a room post route and redirect to not found
  // since room posts should be handled by the dedicated rooms/[slug] route
  if (slug.startsWith('rooms/') && slug !== 'rooms') {
    return notFound()
  }
  
  // Check if this is a product route and redirect to not found
  // since products should be handled by the dedicated products/[slug] route
  if (slug.startsWith('products/') && slug !== 'products') {
    return notFound()
  }
  
  return <DynamicPage params={Promise.resolve({ slug })} searchParams={resolvedSearchParams} />
}
