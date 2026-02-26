import { client } from '../../../sanity.client'
import { footerQuery, menuQuery } from './queries'
import { FooterSettings } from '../../types/footerSettings'

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: {
    pageLink: {
      _id: string
      title?: string
      slug?: string
    }
  }[]
}

export async function getFooterSettings(): Promise<FooterSettings | null> {
  try {
    const footer = await client.fetch(footerQuery)
    return footer
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return null
  }
}

export async function getMenu(): Promise<Menu | null> {
  try {
    const menu = await client.fetch(menuQuery)
    return menu
  } catch (error) {
    console.error('Error fetching menu:', error)
    return null
  }
}

export type AnnouncementPopupSection = {
  enabled?: boolean
  slides?: Array<{
    image?: {
      _type: 'image'
      asset: {
        _ref: string
        _type: 'reference'
      }
    }
    title?: string
    text?: string
    button?: {
      linkType: 'internal' | 'external' | 'jump' | 'file' | 'booking'
      label?: string
      href?: string
      jumpLink?: string
      bookingTab?: 'room' | 'table' | 'golf' | 'spa' | 'activity'
      color?: 'cream' | 'orange' | 'outline'
      pageLink?: {
        _ref?: string
        _type?: string
        slug?: string
        title?: string
      }
      file?: {
        asset?: {
          _ref?: string
          _type?: string
          originalFilename?: string
        }
      }
    }
  }>
}

export async function getAnnouncementPopupSection(): Promise<AnnouncementPopupSection | null> {
  try {
    const footer = await client.fetch(footerQuery)
    if (!footer?.announcementPopup) {
      return null
    }

    return {
      enabled: footer.announcementPopup.enabled,
      slides: footer.announcementPopup.slides,
    }
  } catch (error) {
    console.error('Error fetching announcement popup section:', error)
    return null
  }
}
