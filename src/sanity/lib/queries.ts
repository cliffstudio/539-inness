// src/sanity/lib/queries.ts
import { groq } from 'next-sanity'

/**
 * Simplified query system
 */

// Reusable fragments for consistency and maintainability
const imageFragment = groq`{
  asset {
    _ref,
    _type
  },
  hotspot,
  crop
}`

const videoFragment = groq`{
  asset {
    _ref,
    _type
  }
}`

const linkFragment = groq`{
  linkType,
  label,
  href,
  jumpLink,
  pageLink {
    _ref,
    _type,
    "slug": *[_type == "page" && _id == ^._ref][0].slug.current,
    "title": *[_type == "page" && _id == ^._ref][0].title
  }
}`

const heroSectionFragment = groq`{
  layout,
  heading,
  body,
  image ${imageFragment},
  specs[] {
    body
  },
  button ${linkFragment}
}`

// Main page query
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    hero ${heroSectionFragment}
  }
`

// Page slugs for static generation
export const pageSlugsQuery = groq`
  *[_type == "page"] {
    slug
  }
`

// Homepage specific query
export const homepageQuery = groq`
  *[_type == "page" && pageType == "homepage"][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    hero ${heroSectionFragment}
  }
`

// Footer and menu queries
export const footerQuery = groq`
  *[_type == "footer"][0] {
    _id,
    title,
    footerItems[] {
      heading,
      text
    },
    socialLinks {
      heading,
      links[] {
        linkType,
        label,
        href,
        jumpLink,
        "isExternal": linkType == "external",
        pageLink-> {
          title,
          "slug": slug.current
        }
      }
    },
    footerNav[] {
      linkType,
      label,
      href,
      jumpLink,
      "isExternal": linkType == "external",
      pageLink-> {
        title,
        "slug": slug.current
      }
    }
  }
`

export const leftMenuQuery = groq`
  *[_type == "menu" && title == "Left Menu"][0] {
    _id,
    title,
    items[] {
      itemType,
      pageLink-> {
        _id,
        title,
        "slug": slug.current
      },
      heading,
      subItems[] {
        pageLink-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`

export const rightMenuQuery = groq`
  *[_type == "menu" && title == "Right Menu"][0] {
    _id,
    title,
    items[] {
      itemType,
      pageLink-> {
        _id,
        title,
        "slug": slug.current
      },
      heading,
      subItems[] {
        pageLink-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`

// Press queries
export const pressPostsQuery = groq`
  *[_type == "press"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout
  }
`

export const pressPostQuery = groq`
  *[_type == "press" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout
  }
`

// Export fragments for reuse in other queries if needed
export const fragments = {
  imageFragment,
  videoFragment,
  linkFragment,
  heroSectionFragment
}
