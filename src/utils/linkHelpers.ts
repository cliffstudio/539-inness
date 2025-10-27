import { Link } from '../types/footerSettings'

export const getLinkInfo = (cta?: Link) => {
  if (!cta) return { text: '', href: '' }
  
  if (cta.linkType === 'external') {
    return { text: cta.label || '', href: cta.href || '' }
  } else if (cta.linkType === 'jump') {
    return { text: cta.label || '', href: cta.jumpLink ? `#${cta.jumpLink}` : '' }
  } else {
    // For internal links, use label if provided, otherwise fallback to page title
    const text = cta.label || cta.pageLink?.title || ''
    return { text, href: cta.pageLink?.slug ? `/${cta.pageLink.slug}` : '' }
  }
}
