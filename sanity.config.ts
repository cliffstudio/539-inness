/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {
  apiVersion,
  dataset,
  projectId,
  SANITY_STUDIO_BUNNY_LIBRARY_ID,
  SANITY_STUDIO_BUNNY_CDN_HOSTNAME,
  SANITY_STUDIO_BUNNY_API_KEY,
  SANITY_STUDIO_BUNNY_COLLECTION_NAME,
} from './src/sanity/env'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import { bunnyInput } from '@cliffstudio/sanity-plugin-bunny-input'

export default defineConfig({
  basePath: '/studio',
  projectId,
  server: { port: 3334, hostname: 'localhost' },
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
    bunnyInput({
      libraryId: SANITY_STUDIO_BUNNY_LIBRARY_ID,
      cdnHostname: SANITY_STUDIO_BUNNY_CDN_HOSTNAME,
      apiKey: SANITY_STUDIO_BUNNY_API_KEY,
      collectionName: SANITY_STUDIO_BUNNY_COLLECTION_NAME,
    }),
  ],
})

