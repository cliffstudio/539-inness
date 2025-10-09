import { PortableTextBlock } from './sanity'

export type Link = {
  label: string
  href: string
  isExternal?: boolean
}

export type Header = {
  leftNav: Link[]
  rightNav: Link[]
}

export type Footer = {
  title?: string
  address: PortableTextBlock[]
  contact: PortableTextBlock[]
  social: Link[]
  footerNav: Link[]
}

export type FooterSettings = Footer
