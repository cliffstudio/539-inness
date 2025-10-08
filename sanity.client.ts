// sanity.client.ts
import { createClient } from 'next-sanity'
import { projectId, dataset } from './src/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-10-01',
  useCdn: true,
})
