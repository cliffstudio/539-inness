import React from 'react'
import HeroSection from './HeroSection'
import TextSection from './TextSection'
import MediaTextSection from './MediaTextSection'
import BreakSection from './BreakSection'
import CarouselSection from './CarouselSection'
import MenuSection from './MenuSection'
import ActivitySection from './ActivitySection'
import FeatureSection from './FeatureSection'

interface ContentBlock {
  _type: string
  layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-activity-links' | 'media-with-text-h4-body-links' | 'media-with-text-multiple-text-blocks' | 'split' | 'full-bleed' | 'text-section' | 'carousel-section' | 'food-menu' | 'spa-menu' | 'venue-menu' | 'single-activity' | '2-activities' | '4-activities' | 'single-feature' | '2-features' | '4-features'
  [key: string]: unknown
}

interface FlexibleContentProps {
  contentBlocks: ContentBlock[]
}

const FlexibleContent: React.FC<FlexibleContentProps> = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return null
  }

  // Group consecutive sections that should be grouped
  const groupedBlocks: (ContentBlock | ContentBlock[])[] = []
  let currentRoomGroup: ContentBlock[] = []
  let currentH4BodyGroup: ContentBlock[] = []

  contentBlocks.forEach((block) => {
    const isRoomType = block._type === 'mediaTextSection' && block.layout === 'media-with-text-room-type'
    const isH4Body = block._type === 'mediaTextSection' && block.layout === 'media-with-text-h4-body'

    if (isRoomType) {
      // If we have an h4-body group, add it first
      if (currentH4BodyGroup.length > 0) {
        groupedBlocks.push([...currentH4BodyGroup])
        currentH4BodyGroup = []
      }
      currentRoomGroup.push(block)
    } else if (isH4Body) {
      // If we have a room-type group, add it first
      if (currentRoomGroup.length > 0) {
        groupedBlocks.push([...currentRoomGroup])
        currentRoomGroup = []
      }
      currentH4BodyGroup.push(block)
    } else {
      // If we have any groups, add them and reset
      if (currentRoomGroup.length > 0) {
        groupedBlocks.push([...currentRoomGroup])
        currentRoomGroup = []
      }
      if (currentH4BodyGroup.length > 0) {
        groupedBlocks.push([...currentH4BodyGroup])
        currentH4BodyGroup = []
      }
      groupedBlocks.push(block)
    }
  })

  // Don't forget the last groups if they exist
  if (currentRoomGroup.length > 0) {
    groupedBlocks.push([...currentRoomGroup])
  }
  if (currentH4BodyGroup.length > 0) {
    groupedBlocks.push([...currentH4BodyGroup])
  }

  return (
    <div className="flexible-content">
      {groupedBlocks.map((blockOrGroup, groupIndex) => {
        // If it's an array, it's a group of sections
        if (Array.isArray(blockOrGroup)) {
          const firstBlockLayout = blockOrGroup[0]?.layout
          
          // Determine the group type and className
          const isRoomTypeGroup = firstBlockLayout === 'media-with-text-room-type'
          const isH4BodyGroup = firstBlockLayout === 'media-with-text-h4-body'
          
          // Only wrap in a div if there are multiple sections
          if (blockOrGroup.length === 1) {
            return <MediaTextSection key={groupIndex} {...(blockOrGroup[0] as ContentBlock & { layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-links' | 'media-with-text-multiple-text-blocks' })} />
          }
          
          let groupClassName = ''
          if (isRoomTypeGroup) {
            groupClassName = 'room-type-group'
          } else if (isH4BodyGroup) {
            groupClassName = 'h4-body-group'
          }
          
          return (
            <div key={`group-${groupIndex}`} className={groupClassName}>
              {blockOrGroup.map((block, blockIndex) => (
                <MediaTextSection key={`${groupIndex}-${blockIndex}`} {...(block as ContentBlock & { layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-links' | 'media-with-text-multiple-text-blocks' })} />
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
            return <MediaTextSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-multiple-text-blocks' })} />
          case 'breakSection':
            return <BreakSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'split' | 'full-bleed' })} />
          case 'carouselSection':
            return <CarouselSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'carousel-section' })} />
          case 'menuSection':
            return <MenuSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'food-menu' | 'spa-menu' | 'venue-menu' })} />
          case 'activitySection':
            return <ActivitySection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'single-activity' | '2-activities' | '4-activities' })} />
          case 'featureSection':
            return <FeatureSection key={groupIndex} {...(blockOrGroup as ContentBlock & { layout?: 'single-feature' | '2-features' | '4-features' })} />

          default:
            console.warn(`Unknown content block type: ${blockOrGroup._type}`)
            return null
        }
      })}
    </div>
  )
}

export default FlexibleContent
