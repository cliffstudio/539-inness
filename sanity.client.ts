// sanity.client.ts
import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from './src/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})
