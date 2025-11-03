import { Rule } from 'sanity'

/**
 * Validates that a video file:
 * - Is MP4 format only
 * - Has a file size of 10MB or less
 * @param Rule - Sanity validation rule
 * @returns Custom validation function
 */
export const videoSizeValidation = (Rule: Rule) =>
  Rule.custom(async (value, context) => {
    if (!value?.asset?._ref) {
      return true // Allow empty/undefined values (handle required separately)
    }

    // Get the client from context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getClient = (context as any)?.getClient
    if (!getClient) {
      // If client is not available, skip validation (might happen in some contexts)
      return true
    }

    try {
      const client = getClient({ apiVersion: '2024-01-01' })

      // Fetch the asset document
      const assetId = value.asset._ref
      const asset = await client.getDocument(assetId)

      if (!asset) {
        return true // If asset doesn't exist, skip validation
      }

      // Check MIME type - must be video/mp4
      if (asset.mimeType && asset.mimeType !== 'video/mp4') {
        return `Video must be MP4 format. Current format: ${asset.mimeType}. Please convert the video to MP4.`
      }

      // Check file extension as fallback
      if (asset.originalFilename) {
        const fileExtension = asset.originalFilename.split('.').pop()?.toLowerCase()
        if (fileExtension && fileExtension !== 'mp4') {
          return `Video must be MP4 format. Current file extension: .${fileExtension}. Please convert the video to MP4.`
        }
      }

      // Check file size - 10MB in bytes
      if (asset.size) {
        const maxSize = 10 * 1024 * 1024 // 10MB
        const fileSize = asset.size

        if (fileSize > maxSize) {
          const sizeInMB = Math.round((fileSize / (1024 * 1024)) * 100) / 100
          return `Video size (${sizeInMB}MB) exceeds the maximum allowed size of 10MB. Please compress the video.`
        }
      }

      return true
    } catch {
      // If there's an error fetching the asset, don't block validation
      // This can happen during initial upload before asset is fully processed
      return true
    }
  })

