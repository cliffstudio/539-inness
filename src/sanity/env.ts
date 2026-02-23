export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-05-08'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

// Validate dataset format
if (dataset && !/^[a-z0-9-]+$/.test(dataset)) {
  throw new Error(
    `Invalid Sanity dataset: "${dataset}". Dataset can only contain lowercase letters (a-z), numbers (0-9), and dashes (-).`
  )
}

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

// Validate project ID format
if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error(
    `Invalid Sanity project ID: "${projectId}". Project ID can only contain lowercase letters (a-z), numbers (0-9), and dashes (-).`
  )
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}

// Must use NEXT_PUBLIC_ prefix - Sanity Studio runs in the browser and Next.js
// only exposes env vars with this prefix to client bundles
export const SANITY_STUDIO_BUNNY_LIBRARY_ID = assertValue(
  process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_LIBRARY_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_BUNNY_LIBRARY_ID'
)

export const SANITY_STUDIO_BUNNY_CDN_HOSTNAME = assertValue(
  process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_CDN_HOSTNAME,
  'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_BUNNY_CDN_HOSTNAME'
)

export const SANITY_STUDIO_BUNNY_API_KEY = assertValue(
  process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_API_KEY,
  'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_BUNNY_API_KEY'
)

export const SANITY_STUDIO_BUNNY_COLLECTION_NAME = assertValue(
  process.env.NEXT_PUBLIC_SANITY_STUDIO_BUNNY_COLLECTION_NAME,
  'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_BUNNY_COLLECTION_NAME'
)