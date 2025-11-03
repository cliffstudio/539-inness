"use client"

import { Link as SanityLink } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'

type ButtonLinkProps = {
  link: SanityLink
  className?: string
  fallbackColor?: SanityLink['color']
}

export default function ButtonLink({ link, className = '', fallbackColor = 'cream' }: ButtonLinkProps) {
  const { href, text } = getLinkInfo(link)
  if (!href || !text) return null

  const color = link.color || fallbackColor || 'cream'

  // Map color values to class modifiers
  const colorClass =
    color === 'orange' ? 'button--orange' :
    color === 'outline' ? 'button--outline' :
    'button--cream'

  return (
    <a
      href={href}
      className={`button ${colorClass}${className ? ` ${className}` : ''}`}
      {...(link.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
      {...(link.linkType === 'file' && { target: '_blank', rel: 'noopener noreferrer', download: link.file?.asset?.originalFilename })}
    >
      {text}
    </a>
  )
}


