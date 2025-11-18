'use client'

import React from 'react'
import FlexibleContent from './FlexibleContent'
import HeroSectionShopPost from './HeroSectionShopPost'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface ShopPostProps {
  title: string
  slug: { current: string }
  image?: SanityImageSource
  contentBlocks?: ContentBlock[]
  nextPostSlug?: string
  nextPostTitle?: string
}

const ShopPost: React.FC<ShopPostProps> = ({
  title,
  image,
  contentBlocks,
}) => {
  return (
    <article className="shop-post">
      <HeroSectionShopPost title={title} image={image} />
      {contentBlocks && <FlexibleContent contentBlocks={contentBlocks} />}
    </article>
  )
}

export default ShopPost

