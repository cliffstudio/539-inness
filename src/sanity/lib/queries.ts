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
  id,
  layout,
  heading,
  body,
  image ${imageFragment},
  specs[] {
    body
  },
  button ${linkFragment}
}`

const mediaTextSectionFragment = groq`{
  id,
  layout,
  heading,
  body,
  bulletList,
  buttons[] ${linkFragment},
  mediaType,
  images[] ${imageFragment},
  video ${videoFragment},
  videoPlaceholder ${imageFragment},
  mediaAlignment,
  roomReference-> {
    _id,
    title,
    roomType,
    description,
    "slug": slug.current
  }
}`

const breakSectionFragment = groq`{
  id,
  layout,
  subHeading,
  heading,
  body,
  image ${imageFragment},
  button ${linkFragment}
}`

const carouselSectionFragment = groq`{
  id,
  images[] ${imageFragment}
}`

const flexibleContentFragment = groq`{
  _type,
  ...select(_type == "heroSection" => ${heroSectionFragment}),
  ...select(_type == "mediaTextSection" => ${mediaTextSectionFragment}),
  ...select(_type == "breakSection" => ${breakSectionFragment}),
  ...select(_type == "carouselSection" => ${carouselSectionFragment})
}`

// Main page query
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    contentBlocks[] ${flexibleContentFragment}
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
    heading,
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    videoPlaceholder ${imageFragment},
    contentBlocks[] ${flexibleContentFragment}
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

export const menuQuery = groq`
  *[_type == "menu"][0] {
    _id,
    title,
    items[] {
      pageLink-> {
        _id,
        title,
        "slug": slug.current
      }
    }
  }
`

// Room queries
export const roomPostsQuery = groq`
  *[_type == "room"] | order(title asc) {
    _id,
    title,
    description,
    image ${imageFragment},
    specs[] {
      body
    },
    "slug": slug.current,
    contentBlocks[] ${flexibleContentFragment}
  }
`

export const roomPostQuery = groq`
  *[_type == "room" && slug.current == $slug][0] {
    _id,
    title,
    description,
    image ${imageFragment},
    specs[] {
      body
    },
    "slug": slug.current,
    contentBlocks[] ${flexibleContentFragment}
  }
`

// Export fragments for reuse in other queries if needed
export const fragments = {
  imageFragment,
  videoFragment,
  linkFragment,
  heroSectionFragment
}
