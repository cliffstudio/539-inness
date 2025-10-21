// src/app/(main)/[...slug]/page.tsx
import DynamicPage from '../../../components/DynamicPage'
import { client } from '../../../../sanity.client'
import { pageSlugsQuery } from '../../../sanity/lib/queries'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  const pages = await client.fetch(pageSlugsQuery)
  
  return pages
    .filter((page: { slug: { current: string } }) => {
      // Exclude room posts from this route since they have their own dedicated route
      return !page.slug.current.startsWith('rooms/') || page.slug.current === 'rooms'
    })
    .map((page: { slug: { current: string } }) => ({
      slug: page.slug.current.split('/'),
    }))
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
  
  return <DynamicPage params={Promise.resolve({ slug })} />
}
