// src/sanity/lib/queries.ts
import { groq } from 'next-sanity'

// Reusable fragments
const imageFragment = groq`{
  asset {
    _ref,
    _type
  },
  hotspot,
  crop
}`

const linkFragment = groq`{
  linkType,
  label,
  href,
  pageLink {
    _ref,
    _type,
    "slug": *[_type == "page" && _id == ^._ref][0].slug.current,
    "title": *[_type == "page" && _id == ^._ref][0].title
  }
}`

// Main page query
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    sections[] {
      _type,
      _type == "heroSection" => {
        heading,
        subheading,
        image ${imageFragment},
        cta ${linkFragment}
      },
      _type == "textSection" => {
        heading,
        content
      }
    }
  }
`

// Get all page slugs for static generation
export const pageSlugsQuery = groq`
  *[_type == "page"] {
    slug
  }
`

// Homepage query
export const homepageQuery = groq`
  *[_type == "page" && slug.current == "home" || slug.current == "/"][0] {
    _id,
    _type,
    title,
    sections[] {
      _type,
      _type == "heroSection" => {
        heading,
        subheading,
        image ${imageFragment},
        cta ${linkFragment}
      },
      _type == "textSection" => {
        heading,
        content
      }
    }
  }
`

// Export fragments for reuse
export const fragments = {
  imageFragment,
  linkFragment
}

