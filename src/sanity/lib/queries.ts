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
  color,
  file {
    asset {
      _ref,
      _type,
      originalFilename
    }
  },
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

const textSectionFragment = groq`{
  id,
  heading,
  body,
  button ${linkFragment}
}`

const mediaTextSectionFragment = groq`{
  id,
  layout,
  heading,
  body,
  textBlocks[] {
    header,
    body
  },
  bulletList,
  buttons[] ${linkFragment},
  mediaType,
  images[] ${imageFragment},
  video ${videoFragment},
  videoPlaceholder ${imageFragment},
  mediaAlignment,
  roomLink-> {
    _id,
    title,
    roomType,
    description,
    "slug": slug.current
  },
  roomLinks[]-> {
    _id,
    title,
    roomType,
    description,
    "slug": slug.current,
    image ${imageFragment}
  },
  links[] {
    header,
    description,
    image ${imageFragment},
    buttons[] ${linkFragment}
  }
}`

const breakSectionFragment = groq`{
  id,
  layout,
  subHeading,
  heading,
  body,
  image ${imageFragment},
  button ${linkFragment},
  backgroundColor
}`

const carouselSectionFragment = groq`{
  id,
  images[] ${imageFragment}
}`

const menuSectionFragment = groq`{
  id,
  layout,
  heading,
  image ${imageFragment},
  foodTabs[] {
    tabName,
    availability,
    image ${imageFragment},
    categories[] {
      name,
      items[] {
        name,
        price,
        extras[] {
          name,
          price
        }
      }
    }
  },
  spaTabs[] {
    tabName,
    image ${imageFragment},
    treatments[] {
      name,
      description,
      options[] {
        duration,
        price
      }
    }
  },
  venueInfo {
    name,
    description,
    details[] {
      label,
      value
    },
    includedServices
  }
}`

const activitySectionFragment = groq`{
  id,
  layout,
  heading,
  activity1-> {
    _id,
    title,
    date,
    timeRange,
    image ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity2-> {
    _id,
    title,
    date,
    timeRange,
    image ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity3-> {
    _id,
    title,
    date,
    timeRange,
    image ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity4-> {
    _id,
    title,
    date,
    timeRange,
    image ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  }
}`

const featureSectionFragment = groq`{
  id,
  subHeading,
  heading,
  features[] {
    image ${imageFragment},
    heading,
    body,
    links[] ${linkFragment}
  }
}`

const flexibleContentFragment = groq`{
  _type,
  ...select(_type == "heroSection" => ${heroSectionFragment}),
  ...select(_type == "textSection" => ${textSectionFragment}),
  ...select(_type == "mediaTextSection" => ${mediaTextSectionFragment}),
  ...select(_type == "breakSection" => ${breakSectionFragment}),
  ...select(_type == "carouselSection" => ${carouselSectionFragment}),
  ...select(_type == "menuSection" => ${menuSectionFragment}),
  ...select(_type == "activitySection" => ${activitySectionFragment}),
  ...select(_type == "featureSection" => ${featureSectionFragment})
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
    homepageHeading,
    homepageMediaType,
    homepageImage ${imageFragment},
    homepageVideo ${videoFragment},
    homepageVideoPlaceholder ${imageFragment},
    contentBlocks[] ${flexibleContentFragment}
  }
`

// Activities specific query
export const activitiesQuery = groq`
  *[_type == "page" && pageType == "activities"][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    activitiesHeading,
    activitiesBody,
    activitiesImage ${imageFragment}
  }
`

// Query to get all activities
export const allActivitiesQuery = groq`
  *[_type == "activity"] | order(date asc) {
    _id,
    title,
    date,
    timeRange,
    image ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current,
    activityType
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
      label,
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

// Metadata query
export const metadataQuery = groq`
  *[_type == "metaData"][0] {
    _id,
    title,
    description,
    keywords,
    socialimage ${imageFragment}
  }
`

// Export fragments for reuse in other queries if needed
export const fragments = {
  imageFragment,
  videoFragment,
  linkFragment,
  heroSectionFragment
}
