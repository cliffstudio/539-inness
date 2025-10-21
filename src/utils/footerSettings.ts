import { client } from '../../sanity.client'
import { footerQuery, menuQuery } from '../sanity/lib/queries'
import { FooterSettings } from '../types/footerSettings'

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
