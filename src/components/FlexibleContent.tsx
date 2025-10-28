import React from 'react'
import HeroSection from './HeroSection'
import TextSection from './TextSection'
import MediaTextSection from './MediaTextSection'
import BreakSection from './BreakSection'
import CarouselSection from './CarouselSection'
import MenuSection from './MenuSection'

interface ContentBlock {
  _type: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'split' | 'full-bleed'
  [key: string]: unknown
}

interface FlexibleContentProps {
  contentBlocks: ContentBlock[]
}

const FlexibleContent: React.FC<FlexibleContentProps> = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return null
  }

  // Group consecutive room-type mediaTextSections
  const groupedBlocks: (ContentBlock | ContentBlock[])[] = []
  let currentGroup: ContentBlock[] = []

  contentBlocks.forEach((block) => {
    if (block._type === 'mediaTextSection' && block.layout === 'media-with-text-room-type') {
      currentGroup.push(block)
    } else {
      // If we have a group, add it to groupedBlocks and reset
      if (currentGroup.length > 0) {
        groupedBlocks.push([...currentGroup])
        currentGroup = []
      }
      groupedBlocks.push(block)
    }
  })

  // Don't forget the last group if it exists
  if (currentGroup.length > 0) {
    groupedBlocks.push([...currentGroup])
  }

  return (
    <div className="flexible-content">
      {groupedBlocks.map((blockOrGroup, groupIndex) => {
        // If it's an array, it's a group of room-type sections
        if (Array.isArray(blockOrGroup)) {
          return (
            <div key={`room-group-${groupIndex}`} className="room-type-group">
              {blockOrGroup.map((block, blockIndex) => (
                <MediaTextSection key={`${groupIndex}-${blockIndex}`} {...(block as ContentBlock & { layout: 'media-with-text-room-type' })} />
              ))}
            </div>
          )
        }

        // Otherwise, render individual blocks as before
        switch (blockOrGroup._type) {
          case 'heroSection':
            return <HeroSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'split' | 'full-bleed' })} />
          case 'textSection':
            return <TextSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'text-section' })} />
          case 'mediaTextSection':
            return <MediaTextSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' })} />
          case 'breakSection':
            return <BreakSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'split' | 'full-bleed' })} />
          case 'carouselSection':
            return <CarouselSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'carousel-section' })} />
          case 'menuSection':
            return <MenuSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'food-menu' | 'spa-menu' | 'venue-menu' })} />

          default:
            console.warn(`Unknown content block type: ${blockOrGroup._type}`)
            return null
        }
      })}
    </div>
  )
}

export default FlexibleContent
