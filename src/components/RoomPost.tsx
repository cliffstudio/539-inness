'use client'

import React from 'react'
import FlexibleContent from './FlexibleContent'
import HeroSectionRoomPost from './HeroSectionRoomPost'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { PortableTextBlock } from '@portabletext/react'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface RoomPostProps {
  title: string
  slug: { current: string }
  image?: SanityImageSource
  description?: PortableTextBlock[]
  specs?: Array<{ body?: string }>
  contentBlocks?: ContentBlock[]
  nextPostSlug?: string
  nextPostTitle?: string
}

const RoomPost: React.FC<RoomPostProps> = ({
  title,
  image,
  description,
  specs,
  contentBlocks,
}) => {
  return (
    <article className="room-post">
      <HeroSectionRoomPost title={title} image={image} description={description} specs={specs} />
      {contentBlocks && <FlexibleContent contentBlocks={contentBlocks} />}
    </article>
  )
}

export default RoomPost
