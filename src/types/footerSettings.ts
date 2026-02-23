export type Link = {
  linkType: 'internal' | 'external' | 'jump' | 'file' | 'booking'
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
  bookingTab?: 'room' | 'table' | 'golf' | 'spa' | 'activity' | 'events'
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

export type AnnouncementPopup = {
  enabled?: boolean
  slides?: AnnouncementSlide[]
}

export type Footer = {
  navigationColumn1?: NavigationColumn
  navigationColumn2?: NavigationColumn
  followColumn?: FollowColumn
  contactColumn?: ContactColumn
  announcementPopup?: AnnouncementPopup
}

export type FooterSettings = Footer

export type AnnouncementSlide = {
  image?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  title?: string
  text?: string
  button?: Link
}
