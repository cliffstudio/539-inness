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

export type SanityVideo = 
  | string // New format: Bunny.net URL
  | {
      _type: 'file'
      asset: {
        _ref: string
        _type: 'reference'
      }
    } // Old format: Sanity file reference (for backward compatibility)

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
