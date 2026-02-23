export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/** Bunny video: URL string or object from bunnyVideo field (plugin stores videoId, playbackUrl, mp4Url, thumbnailUrl) */
export type SanityVideo =
  | string
  | {
      videoId?: string
      playbackUrl?: string
      mp4Url?: string
      thumbnailUrl?: string
    }

export type PortableTextBlock = {
  _type: string
  children: Array<{
    _type: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
  }>
}
