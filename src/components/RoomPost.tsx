'use client'

import React from 'react'
import FlexibleContent from './FlexibleContent'
import HeroSectionRoomPost from './HeroSectionRoomPost'
import MoreRoomsSection from './MoreRoomsSection'
import type { SanityImageSource } from '@sanity/image-url'
import { PortableTextBlock } from '@portabletext/react'
import { SanityImage } from '../types/sanity'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface OtherRoom {
  _id: string
  title: string
  roomType: 'cabin' | 'farmhouse'
  description?: PortableTextBlock[]
  slug: string
  image?: SanityImage
}

interface RoomPostProps {
  title: string
  slug: { current: string }
  images?: SanityImageSource[]
  description?: PortableTextBlock[]
  specs?: Array<{ body?: string }>
  contentBlocks?: ContentBlock[]
  nextPostSlug?: string
  nextPostTitle?: string
  otherRooms?: OtherRoom[]
}

const RoomPost: React.FC<RoomPostProps> = ({
  title,
  images,
  description,
  specs,
  contentBlocks,
  otherRooms,
}) => {
  return (
    <article className="room-post">
      <HeroSectionRoomPost title={title} images={images} description={description} specs={specs} />
      {contentBlocks && <FlexibleContent contentBlocks={contentBlocks} />}
      {otherRooms && otherRooms.length > 0 && (
        <MoreRoomsSection
          heading="More Rooms"
          roomLinks={otherRooms}
        />
      )}
    </article>
  )
}

export default RoomPost
