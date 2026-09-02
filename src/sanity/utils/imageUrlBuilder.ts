import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const hasImageAsset = (source: SanityImageSource | null | undefined): source is SanityImageSource => {
  if (!source) return false

  if (typeof source === 'string') return true

  if ('asset' in source) {
    const asset = source.asset
    if (!asset) return false
    if (typeof asset === 'object' && '_ref' in asset) return Boolean(asset._ref)
    return true
  }

  if ('_ref' in source) return Boolean(source._ref)

  return false
}

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source).auto('format')
}

type ImageFit = 'crop' | 'max' | 'clip' | 'fill' | 'scale' | 'min'

interface SizedImageOptions {
  width: number
  height?: number
  quality?: number
  fit?: ImageFit
}

function sizedImage(source: SanityImageSource, options: SizedImageOptions) {
  const { width, height, quality = 85, fit = 'crop' } = options
  let img = urlFor(source).width(width).quality(quality).fit(fit)
  if (height) img = img.height(height)
  return img
}

/** Full-bleed heroes and break sections — max ~2400px covers 2x retina on large screens */
export const urlForHero = (source: SanityImageSource) =>
  sizedImage(source, { width: 2400 }).url()

/** Primary content images in sections and media blocks */
export const urlForContent = (source: SanityImageSource) =>
  sizedImage(source, { width: 1600 }).url()

/** Cards, thumbnails, and grid items */
export const urlForCard = (source: SanityImageSource) =>
  sizedImage(source, { width: 800 }).url()

/** Carousel slides */
export const urlForCarousel = (source: SanityImageSource) =>
  sizedImage(source, { width: 1200, height: 800 }).url()