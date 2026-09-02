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