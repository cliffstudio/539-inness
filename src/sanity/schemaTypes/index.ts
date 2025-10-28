// Global
import { pageType } from './pageType'
import { menuType } from './menuType'
import { footerType } from './footerType'
import { roomType } from './roomType'
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

export const schemaTypes = [
  // Global
  pageType,
  menuType,
  footerType,
  roomType,
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
  menuSection
]
