import { SanityVideo } from '@/types/sanity'

const BUNNY_CDN_HOSTNAME =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_CDN_HOSTNAME : ''

export type VideoResolution = 360 | 480

const DEFAULT_RESOLUTION: VideoResolution = 480
const MOBILE_BREAKPOINT = '(min-width: 768px)'

function getStoredVideo(video: SanityVideo): {
  videoId?: string
  mp4Url?: string
  playbackUrl?: string
  thumbnailUrl?: string
} | null {
  if (typeof video === 'string') return null
  if (!video || typeof video !== 'object') return null
  return video
}

function buildMp4Url(videoId: string, resolution: VideoResolution): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/play_${resolution}p.mp4`
}

export function getPreferredVideoResolution(): VideoResolution {
  if (typeof window === 'undefined') return DEFAULT_RESOLUTION
  return window.matchMedia(MOBILE_BREAKPOINT).matches ? 480 : 360
}

export function videoPosterUrlFor(video: SanityVideo | null | undefined): string | undefined {
  const stored = video ? getStoredVideo(video) : null
  if (stored?.thumbnailUrl) return stored.thumbnailUrl
  if (stored?.videoId && BUNNY_CDN_HOSTNAME) {
    return `https://${BUNNY_CDN_HOSTNAME}/${stored.videoId}/thumbnail.jpg`
  }
  return undefined
}

/**
 * Prefer MP4 for native <video> (works in all browsers). HLS (playbackUrl) often
 * doesn't work in a plain video src. Pass `resolution` to cap quality for background video.
 */
export const videoUrlFor = (
  video: SanityVideo | null | undefined,
  options?: { resolution?: VideoResolution }
): string => {
  if (typeof video === 'string') return video
  if (!video || typeof video !== 'object') return ''

  const resolution = options?.resolution
  const videoId = video.videoId

  if (resolution && videoId && BUNNY_CDN_HOSTNAME) {
    return buildMp4Url(videoId, resolution)
  }

  if (video.mp4Url) return video.mp4Url
  if (video.playbackUrl) return video.playbackUrl

  if (videoId && BUNNY_CDN_HOSTNAME) {
    return buildMp4Url(videoId, DEFAULT_RESOLUTION)
  }

  return ''
}
