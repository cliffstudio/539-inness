// src/app/(main)/[...slug]/page.tsx
import DynamicPage from '../../../components/DynamicPage'
import { client } from '../../../../sanity.client'
import { pageSlugsQuery, calendarSlugsQuery } from '../../../sanity/lib/queries'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  const [pages, calendarSlugs] = await Promise.all([
    client.fetch(pageSlugsQuery),
    client.fetch(calendarSlugsQuery),
  ])

  const pageParams = pages
    .filter((page: { slug: { current: string } }) => {
      const isRoomPost = page.slug.current.startsWith('rooms/') && page.slug.current !== 'rooms'
      const isProduct = page.slug.current.startsWith('products/') && page.slug.current !== 'products'
      return !isRoomPost && !isProduct
    })
    .map((page: { slug: { current: string } }) => ({
      slug: page.slug.current.split('/'),
    }))

  const calendarParams = (calendarSlugs as { slug: string | null }[])
    .filter((c) => c.slug)
    .map((c) => ({ slug: ['calendar', c.slug!] }))

  return [...pageParams, ...calendarParams]
}

export default async function Page({ params }: PageProps) {
  // Convert array to string for the slug
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  
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
  
  return <DynamicPage params={Promise.resolve({ slug })} />
}
