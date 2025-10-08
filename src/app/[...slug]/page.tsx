// src/app/[...slug]/page.tsx
import { client } from '../../sanity.client'
import { pageSlugsQuery, pageQuery } from '../sanity/lib/queries'
import { PageRenderer } from '../components/PageRenderer'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  const pages = await client.fetch(pageSlugsQuery)
  
  return pages
    .filter((page: { slug: { current: string } }) => page.slug.current !== 'home' && page.slug.current !== '/')
    .map((page: { slug: { current: string } }) => ({
      slug: page.slug.current.split('/'),
    }))
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  
  const page = await client.fetch(pageQuery, { slug })
  
  if (!page) {
    return notFound()
  }
  
  return <PageRenderer page={page} />
}

