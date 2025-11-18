import { notFound } from 'next/navigation'
import { client } from '../../../../../sanity.client'
import { shopPostQuery, shopPostsQuery } from '../../../../sanity/lib/queries'
import ShopPost from '../../../../components/ShopPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'

export const revalidate = 0

interface ShopPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "shop"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default async function ShopPostPage({ params }: ShopPostPageProps) {
  const resolvedParams = await params
  
  // Fetch the current post and all posts to determine navigation
  const [post, allPosts] = await Promise.all([
    client.fetch(shopPostQuery, { slug: resolvedParams.slug }),
    client.fetch(shopPostsQuery)
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
        pageType="shop-post" 
        slug={post.slug?.current} 
      />
      <ShopPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
      />
    </>
  )
}

