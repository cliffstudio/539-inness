import { PortableTextBlock } from './sanity'

export type Link = {
  linkType: 'internal' | 'external' | 'jump' | 'file'
  label?: string
  href?: string
  isExternal?: boolean
  pageLink?: {
    title?: string
    slug?: string
  }
  jumpLink?: string
  file?: {
    asset?: {
      _ref?: string
      _type?: string
      originalFilename?: string
    }
  }
  color?: 'cream' | 'orange' | 'outline'
}

export type Header = {
  leftNav: Link[]
  rightNav: Link[]
}

export type FooterItem = {
  heading?: string
  text?: PortableTextBlock[]
}

export type SocialLinks = {
  heading?: string
  links?: Link[]
}

export type Footer = {
  title?: string
  footerItems?: FooterItem[]
  socialLinks?: SocialLinks
  footerNav?: Link[]
}

export type FooterSettings = Footer
