import { PortableTextBlock } from './sanity'

export type Link = {
  linkType: 'internal' | 'external'
  label?: string
  href?: string
  isExternal?: boolean
  pageLink?: {
    title?: string
    slug?: string
  }
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
