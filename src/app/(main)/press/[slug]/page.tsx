import { notFound } from 'next/navigation'
import { client } from '../../../../../sanity.client'
import { pressPostQuery, pressPostsQuery } from '../../../../sanity/lib/queries'
import PressPost from '../../../../components/PressPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'

interface PressPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "press"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default async function PressPostPage({ params }: PressPostPageProps) {
  const resolvedParams = await params
  
  // Fetch the current post and all posts to determine navigation
  const [post, allPosts] = await Promise.all([
    client.fetch(pressPostQuery, { slug: resolvedParams.slug }),
    client.fetch(pressPostsQuery)
  ])

  if (!post) {
    notFound()
  }

  // Find the current post index and determine next post
  const currentIndex = allPosts.findIndex((p: { slug: { current: string } }) => p.slug.current === resolvedParams.slug)
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 
    ? allPosts[currentIndex + 1] 
    : allPosts[0] // If on last post, go to first post

  return (
    <>
      <BodyClassProvider 
        pageType="press-post" 
        slug={post.slug?.current} 
      />
      <PressPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
      />
    </>
  )
}
