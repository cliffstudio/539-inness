import { SanityVideo } from '@/types/sanity'

const BUNNY_CDN_HOSTNAME =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_CDN_HOSTNAME : ''

/**
 * Prefer MP4 for native <video> (works in all browsers). HLS (playbackUrl) often
 * doesn't work in a plain video src. If stored object has no URLs, build from videoId.
 */
export const videoUrlFor = (video: SanityVideo | null | undefined): string => {
  if (typeof video === 'string') return video
  if (!video || typeof video !== 'object') return ''

  // Prefer mp4Url for native video element (broad compatibility); fallback to HLS
  const stored = (video as { mp4Url?: string; playbackUrl?: string; videoId?: string })
  if (stored.mp4Url) return stored.mp4Url
  if (stored.playbackUrl) return stored.playbackUrl

  // Build MP4 URL from videoId when plugin hasn't persisted URLs (e.g. ready before poll wrote them)
  const videoId = stored.videoId
  if (videoId && BUNNY_CDN_HOSTNAME) {
    return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/play_720p.mp4`
  }

  return ''
}
