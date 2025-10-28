// Global
import { pageType } from './pageType'
import { roomType } from './roomType'
import { eventType } from './eventType'
import { menuType } from './menuType'
import { footerType } from './footerType'
import { metaDataType } from './metaDataType'

// Objects
import link from './objects/link'
import detailedLink from './objects/detailedLink'
import richPortableText from './objects/richPortableText'
import flexibleContent from './objects/flexibleContent'

// Sections
import heroSection from './sections/heroSection'
import textSection from './sections/textSection'
import mediaTextSection from './sections/mediaTextSection'
import breakSection from './sections/breakSection'
import carouselSection from './sections/carouselSection'
import menuSection from './sections/menuSection'
import eventSection from './sections/eventSection'

export const schemaTypes = [
  // Global
  pageType,
  roomType,
  eventType,
  menuType,
  footerType,
  metaDataType,

  // Objects
  link,
  detailedLink,
  richPortableText,
  flexibleContent,

  // Sections
  heroSection,
  textSection,
  mediaTextSection,
  breakSection,
  carouselSection,
  menuSection,
  eventSection,
]
