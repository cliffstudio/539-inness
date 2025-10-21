import { Link } from '../types/footerSettings'

export const getLinkInfo = (cta?: Link) => {
  if (!cta) return { text: '', href: '' }
  
  if (cta.linkType === 'external') {
    return { text: cta.label || '', href: cta.href || '' }
  } else {
    return { text: cta.pageLink?.title || '', href: cta.pageLink?.slug ? `/${cta.pageLink.slug}` : '' }
  }
}
