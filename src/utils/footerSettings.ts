import { client } from '../../sanity.client'
import { footerQuery, leftMenuQuery, rightMenuQuery } from '../sanity/lib/queries'
import { FooterSettings } from '../types/footerSettings'

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: {
    itemType: 'pageLink' | 'titleWithSubItems'
    pageLink?: {
      _id: string
      title?: string
      slug?: string
    }
    heading?: string
    subItems?: {
      pageLink: {
        _id: string
        title?: string
        slug?: string
      }
    }[]
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

export async function getLeftMenu(): Promise<Menu | null> {
  try {
    const menu = await client.fetch(leftMenuQuery)
    return menu
  } catch (error) {
    console.error('Error fetching left menu:', error)
    return null
  }
}

export async function getRightMenu(): Promise<Menu | null> {
  try {
    const menu = await client.fetch(rightMenuQuery)
    return menu
  } catch (error) {
    console.error('Error fetching right menu:', error)
    return null
  }
}
