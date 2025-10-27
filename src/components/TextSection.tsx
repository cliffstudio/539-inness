"use client"

import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'

interface textSectionProps {
  id?: string
  heading?: string
  body?: PortableTextBlock[]
  button?: Link
}

export default function TextSection({ 
  id,
  heading,
  body, 
  button, 
}: textSectionProps) {
  const linkInfo = button ? getLinkInfo(button) : null
  
  return (
    <section id={id} className="text-section h-pad">
      <div className="text-wrap">
        {heading && (
          <h4 className="text-heading">{heading}</h4>
        )}
        
        {body && body.length > 0 && (
          <div className="text-body">
            <PortableText value={body} />
          </div>
        )}

        {linkInfo && linkInfo.href && linkInfo.text && button && (
          <a 
            href={linkInfo.href}
            className="button button--orange"
            {...(button.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}>
            {linkInfo.text}
          </a>
        )}
      </div>
    </section>
  )
}
