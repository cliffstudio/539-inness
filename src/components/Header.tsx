'use client'

// Type for menu items from menuType schema
type MenuItem = {
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
}

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: MenuItem[]
}

interface HeaderProps {
  leftMenu?: Menu
  rightMenu?: Menu
}

export default function Header({ }: HeaderProps) {
  return (
    <header className="site-header h-pad">
    </header>
  )
}
