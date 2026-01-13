import React from 'react'
import HeroSection from './HeroSection'
import TextSection from './TextSection'
import MediaTextSection from './MediaTextSection'
import BreakSection from './BreakSection'
import CarouselSection from './CarouselSection'
import MenuSection from './MenuSection'
import ActivitySection from './ActivitySection'
import FeatureSection from './FeatureSection'
import BookingSection from './BookingSection'
import ProductSection from './ProductSection'

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

  return (
    <div className="flexible-content">
      {contentBlocks.map((block, index) => {
        switch (block._type) {
          case 'heroSection':
            return <HeroSection key={index} {...(block as ContentBlock & { layout?: 'split' | 'full-bleed' })} />
          case 'textSection':
            return <TextSection key={index} {...(block as ContentBlock & { layout?: 'text-section' })} />
          case 'mediaTextSection':
            return <MediaTextSection key={index} {...(block as ContentBlock & { layout?: 'media-with-text-h5' | 'media-with-text-h4-body' | 'media-with-text-room-type' | 'media-with-text-h4-bullet-list' | 'media-with-text-h4-body-room-links' | 'media-with-text-h4-body-activity-links' | 'media-with-text-h4-body-links' | 'media-with-text-multiple-text-blocks' })} />
          case 'breakSection':
            return <BreakSection key={index} {...(block as ContentBlock & { layout?: 'split' | 'full-bleed' })} />
          case 'carouselSection':
            return <CarouselSection key={index} {...(block as ContentBlock & { layout?: 'carousel-section' })} />
          case 'menuSection':
            return <MenuSection key={index} {...(block as ContentBlock & { layout?: 'food-menu' | 'spa-menu' | 'venue-menu' })} />
          case 'activitySection':
            return <ActivitySection key={index} {...(block as ContentBlock & { layout?: 'single-activity' | '2-activities' | '4-activities' })} />
          case 'featureSection':
            return <FeatureSection key={index} {...(block as ContentBlock & { layout?: 'single-feature' | '2-features' | '4-features' })} />
          case 'bookingSection':
            return (block as ContentBlock & { show?: boolean; noTopPad?: boolean; noBottomPad?: boolean }).show !== false ? (
              <BookingSection 
                key={index} 
                noTopPad={(block as ContentBlock & { noTopPad?: boolean }).noTopPad}
                noBottomPad={(block as ContentBlock & { noBottomPad?: boolean }).noBottomPad}
              />
            ) : null
          case 'productSection':
            return <ProductSection key={index} {...(block as ContentBlock & { heading?: string; products?: unknown[] })} />

          default:
            console.warn(`Unknown content block type: ${block._type}`)
            return null
        }
      })}
    </div>
  )
}

export default FlexibleContent
