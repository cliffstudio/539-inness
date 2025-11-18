import { notFound } from 'next/navigation'
import { client } from '../../../../../sanity.client'
import { roomPostQuery, roomPostsQuery, otherRoomsQuery } from '../../../../sanity/lib/queries'
import RoomPost from '../../../../components/RoomPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'

export const revalidate = 0

interface RoomPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "room"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default async function RoomPostPage({ params }: RoomPostPageProps) {
  const resolvedParams = await params
  
  // Fetch the current post, all posts to determine navigation, and other rooms
  const [post, allPosts, otherRooms] = await Promise.all([
    client.fetch(roomPostQuery, { slug: resolvedParams.slug }),
    client.fetch(roomPostsQuery),
    client.fetch(otherRoomsQuery, { slug: resolvedParams.slug })
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
        pageType="room-post" 
        slug={post.slug?.current} 
      />
      <RoomPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
        otherRooms={otherRooms}
      />
    </>
  )
}
