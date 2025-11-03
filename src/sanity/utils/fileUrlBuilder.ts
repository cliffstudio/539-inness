import { dataset, projectId } from '../env'

export type SanityFile = {
  _type?: 'file'
  asset?: {
    _ref: string
    _type?: 'reference'
    originalFilename?: string
  }
}

export const fileUrlFor = (file: SanityFile): string => {
  if (!file?.asset?._ref) {
    return ''
  }
  
  // Construct Sanity file URL
  // Format: https://cdn.sanity.io/files/{projectId}/{dataset}/{assetId}
  // The asset reference format is: "file-{hash}-{extension}"
  // The URL format needs: "{hash}.{extension}"
  const assetId = file.asset._ref.replace('file-', '')
  
  // Extract extension from assetId (format: hash-extension)
  // Find the last hyphen to separate hash from extension
  const lastHyphenIndex = assetId.lastIndexOf('-')
  if (lastHyphenIndex === -1 || lastHyphenIndex === 0) {
    return '' // Invalid format
  }
  
  const hash = assetId.substring(0, lastHyphenIndex)
  const extension = assetId.substring(lastHyphenIndex + 1)
  
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${hash}.${extension}`
}

