"use client"

import React from 'react'
import { PortableText, PortableTextBlock } from '@portabletext/react'

type TextBlock = {
  _key?: string
  header?: string
  body?: PortableTextBlock[]
}

interface TextPageProps {
  title?: string
  textBlocks?: TextBlock[]
}

const TextPage: React.FC<TextPageProps> = ({ title, textBlocks }) => {
  if (!textBlocks || textBlocks.length === 0) {
    return null
  }

  return (
    <div className="text-page h-pad">
      <div className="inner-wrap out-of-opacity">
        {title && (
          <h4 className="text-page__title">{title}</h4>
        )}

        {textBlocks.map((block, index) => {
          const key = block._key ?? `${block.header ?? 'text-block'}-${index}`

          return (
            <section key={key} className="text-page__block">
              {block.header && <h5 className="text-page__header">{block.header}</h5>}

              {block.body && block.body.length > 0 && (
                <div className="text-page__body">
                  <PortableText value={block.body} />
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default TextPage

