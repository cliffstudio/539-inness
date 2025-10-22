import React from 'react'
import HeroSection from './HeroSection'
import MediaTextSection from './MediaTextSection'
import BreakSection from './BreakSection'

interface ContentBlock {
  _type: string
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
            return <HeroSection key={index} {...block} />
          case 'mediaTextSection':
            return <MediaTextSection key={index} {...block} />
          case 'breakSection':
            return <BreakSection key={index} {...block} />

          default:
            console.warn(`Unknown content block type: ${block._type}`)
            return null
        }
      })}
    </div>
  )
}

export default FlexibleContent
