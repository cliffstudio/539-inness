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

const linkFragment = groq`{
  linkType,
  label,
  href,
  jumpLink,
  bookingTab,
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

const footerLinkFragment = groq`{
  linkType,
  label,
  href,
  jumpLink,
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
  mediaType,
  images[] ${imageFragment},
  video,
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
    layout,
    header,
    body,
    bulletList[] {
      body
    }
  },
  bulletList[] {
    body
  },
  buttons[] ${linkFragment},
  mediaType,
  images[] ${imageFragment},
  video,
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
    images[] ${imageFragment}
  },
  activityLinks[]-> {
    _id,
    title,
    description,
    "slug": slug.current,
    images[] ${imageFragment},
    bookingHref,
    date,
    timeRange
  },
  links[] {
    header,
    body,
    date,
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
  venueTabs[] {
    areaName,
    areaDescription,
    image ${imageFragment},
    specs[] {
      specName,
      specDescription
    }
  }
}`

const activitySectionFragment = groq`{
  id,
  layout,
  heading,
  activity1-> {
    _id,
    title,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    images[] ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity2-> {
    _id,
    title,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    images[] ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity3-> {
    _id,
    title,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    images[] ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  },
  activity4-> {
    _id,
    title,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    images[] ${imageFragment},
    description,
    bookingHref,
    "slug": slug.current
  }
}`

const featureSectionFragment = groq`{
  id,
  layout,
  subHeading,
  heading,
  feature1 {
    image ${imageFragment},
    heading,
    body,
    links[] ${linkFragment}
  },
  feature2 {
    image ${imageFragment},
    heading,
    body,
    links[] ${linkFragment}
  },
  feature3 {
    image ${imageFragment},
    heading,
    body,
    links[] ${linkFragment}
  },
  feature4 {
    image ${imageFragment},
    heading,
    body,
    links[] ${linkFragment}
  }
}`

const bookingSectionFragment = groq`{
  id,
  show,
  noTopPad,
  noBottomPad
}`

const productSectionFragment = groq`{
  id,
  heading,
  products[]-> {
    _id,
    store {
      title,
      slug {
        current
      },
      previewImageUrl,
      priceRange {
        minVariantPrice,
        maxVariantPrice
      },
      status,
      isDeleted,
      options[] {
        name,
        values
      },
      variants[]-> {
        store {
          inventory {
            available,
            isAvailable
          },
          option1,
          option2,
          option3,
          colorHex
        }
      }
    }
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
  ...select(_type == "featureSection" => ${featureSectionFragment}),
  ...select(_type == "bookingSection" => ${bookingSectionFragment}),
  ...select(_type == "productSection" => ${productSectionFragment})
}`

// Main page query
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    textBlocks[] {
      _key,
      header,
      body
    },
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
    homepageImages[] ${imageFragment},
    homepageVideo,
    contentBlocks[] ${flexibleContentFragment}
  }
`

// Calendar specific query
export const activitiesQuery = groq`
  *[_type == "page" && pageType == "calendar"][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    calendarHeading,
    calendarBody,
    calendarMediaType,
    calendarImages[] ${imageFragment},
    calendarVideo
  }
`

// Links specific query
export const linksQuery = groq`
  *[_type == "page" && pageType == "links" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    heading,
    body,
    mediaType,
    images[] ${imageFragment},
    video,
    links[] {
      header,
      body,
      date,
      image ${imageFragment},
      buttons[] ${linkFragment}
    }
  }
`

// Query to get all calendar events
export const allCalendarQuery = groq`
  *[_type == "calendar"] | order(startsAt asc) {
    _id,
    title,
    startsAt,
    endsAt,
    locationName,
    locationAddress,
    "slug": slug.current
  }
`

export const siteSearchQuery = groq`
  {
    "activities": *[_type == "calendar" && (
      title match $wildcardTerm ||
      locationName match $wildcardTerm ||
      locationAddress match $wildcardTerm
    )] | order(startsAt asc) {
      _id,
      title,
      "slug": slug.current,
      startsAt,
      endsAt,
      locationName,
      "descriptionPlain": coalesce(locationName, locationAddress, ""),
      "resultType": "activity"
    },
    "pages": *[_type == "page" && defined(slug.current) && (
      title match $wildcardTerm ||
      slug.current match $wildcardTerm ||
      pageType match $wildcardTerm
    )] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      pageType,
      "descriptionPlain": coalesce(pt::text(contentBlocks[_type == "heroSection"][0].body), ""),
      "resultType": "page"
    }
  }
`

// Single calendar event by slug (for calendar/xxx detail pages)
export const calendarQuery = groq`
  *[_type == "calendar" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    startsAt,
    endsAt,
    locationName,
    locationAddress
  }
`

export const calendarSlugsQuery = groq`
  *[_type == "calendar" && defined(slug.current)] {
    "slug": slug.current
  }
`

// Footer and menu queries
export const footerQuery = groq`
  *[_type == "footer"][0] {
    _id,
    navigationColumn1 {
      heading,
      links[] ${footerLinkFragment}
    },
    navigationColumn2 {
      heading,
      links[] ${footerLinkFragment}
    },
    followColumn {
      heading,
      links[] ${footerLinkFragment}
    },
    contactColumn {
      heading,
      contactItems[] {
        label,
        phoneNumber,
        extension
      }
    },
    announcementPopup {
      enabled,
      slides[] {
        image ${imageFragment},
        title,
        text,
        button ${linkFragment}
      }
    }
  }
`

export const menuQuery = groq`
  *[_type == "menu"][0] {
    _id,
    title,
    items[] {
      linkType,
      label,
      href,
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
    images[] ${imageFragment},
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
    images[] ${imageFragment},
    specs[] {
      body
    },
    "slug": slug.current,
    contentBlocks[] ${flexibleContentFragment}
  }
`

export const otherRoomsQuery = groq`
  *[_type == "room" && slug.current != $slug] | order(title asc) {
    _id,
    title,
    roomType,
    description,
    "slug": slug.current,
    "image": images[0] ${imageFragment}
  }
`

// Product queries
export const productQuery = groq`
  *[_type == "product" && store.slug.current == $slug][0] {
    _id,
    body,
    store {
      title,
      slug {
        current
      },
      previewImageUrl,
      images,
      descriptionHtml,
      priceRange {
        minVariantPrice,
        maxVariantPrice
      },
      status,
      isDeleted,
      id,
      gid,
      options[] {
        name,
        values
      },
      variants[]-> {
        _id,
        store {
          id,
          gid,
          title,
          price,
          sku,
          previewImageUrl,
          option1,
          option2,
          option3,
          colorHex,
          inventory {
            available,
            isAvailable
          }
        }
      }
    }
  }
`

export const productSlugsQuery = groq`
  *[_type == "product" && defined(store.slug.current) && store.status == "active" && !store.isDeleted] {
    "slug": store.slug.current
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
  linkFragment,
  heroSectionFragment
}
