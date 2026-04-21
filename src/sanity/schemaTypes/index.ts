// Global
import { pageType } from './pageType'
import { roomType } from './roomType'
import { menuType } from './menuType'
import { footerType } from './footerType'
import { siteSettingsType } from './siteSettings'
import { productType } from './product'
import { productVariantType } from './productVariant'
import { calendarType } from './eventPageType'

// Objects
import link from './objects/link'
import footerLink from './objects/footerLink'
import detailedLink from './objects/detailedLink'
import richPortableText from './objects/richPortableText'
import flexibleContent from './objects/flexibleContent'
import proxyString from './objects/proxyString'
import shopifyProduct from './objects/shopifyProduct'
import shopifyProductVariant from './objects/shopifyProductVariant'
import priceRange from './objects/priceRange'
import option from './objects/option'
import inventory from './objects/inventory'
import seo from './objects/seo'

// Sections
import heroSection from './sections/heroSection'
import textSection from './sections/textSection'
import mediaTextSection from './sections/mediaTextSection'
import breakSection from './sections/breakSection'
import carouselSection from './sections/carouselSection'
import menuSection from './sections/menuSection'
import calendarSection from './sections/calendarSection'
import featureSection from './sections/featureSection'
import bookingSection from './sections/bookingSection'
import productSection from './sections/productSection'

export const schemaTypes = [
  // Global
  pageType,
  roomType,
  menuType,
  footerType,
  siteSettingsType,
  productType,
  productVariantType,
  calendarType,

  // Objects
  link,
  footerLink,
  detailedLink,
  richPortableText,
  flexibleContent,
  proxyString,
  shopifyProduct,
  shopifyProductVariant,
  priceRange,
  option,
  inventory,
  seo,

  // Sections
  heroSection,
  textSection,
  mediaTextSection,
  breakSection,
  carouselSection,
  menuSection,
  calendarSection,
  featureSection,
  bookingSection,
  productSection,
]
