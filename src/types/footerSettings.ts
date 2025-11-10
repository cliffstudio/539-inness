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

export type NavigationColumn = {
  heading?: string
  links?: Link[]
}

export type FollowColumn = {
  heading?: string
  links?: Link[]
}

export type ContactItem = {
  label?: string
  phoneNumber?: string
  extension?: string
}

export type ContactColumn = {
  heading?: string
  contactItems?: ContactItem[]
}

export type Footer = {
  navigationColumn1?: NavigationColumn
  navigationColumn2?: NavigationColumn
  followColumn?: FollowColumn
  contactColumn?: ContactColumn
}

export type FooterSettings = Footer
