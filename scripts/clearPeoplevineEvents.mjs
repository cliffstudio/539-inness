import sanityClient from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-05-08',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function run() {
  // ONLY delete Peoplevine-managed calendar docs
  await client.delete({
    query: '*[_type == "calendar" && defined(peoplevineId)]',
  })
  console.log('Deleted all Peoplevine calendar events')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})