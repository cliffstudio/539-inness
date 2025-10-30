"use client"

import { PortableText, PortableTextBlock } from '@portabletext/react'
import { Link } from '../types/footerSettings'
import ButtonLink from './ButtonLink'

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
  const linkInfo = button ? { has: true } : null
  
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

        {linkInfo && button && (
          <ButtonLink link={button} fallbackColor="orange" />
        )}
      </div>
    </section>
  )
}
