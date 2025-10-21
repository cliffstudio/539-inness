'use client'

import React from 'react'
import FlexibleContent from './FlexibleContent'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface RoomPostProps {
  title: string
  slug: { current: string }
  contentBlocks?: ContentBlock[]
  nextPostSlug?: string
  nextPostTitle?: string
}

const RoomPost: React.FC<RoomPostProps> = ({
  contentBlocks,
}) => {
  return (
    <article className="room-post">
      {contentBlocks && <FlexibleContent contentBlocks={contentBlocks} />}
    </article>
  )
}

export default RoomPost
