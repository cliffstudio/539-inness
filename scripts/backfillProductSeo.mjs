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

function stripHtmlToPlainText(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function run() {
  const products = await client.fetch(
    `*[_type == "product" && defined(store.title)]{
      _id,
      seo,
      "title": store.title,
      "descriptionHtml": store.descriptionHtml,
      "previewImageUrl": store.previewImageUrl
    }`
  )

  const tx = client.transaction()

  for (const product of products) {
    const seo = {
      _type: 'seo',
      metaTitle: product.title || '',
      metaDescription: stripHtmlToPlainText(product.descriptionHtml || ''),
      socialImageUrl: product.previewImageUrl || '',
    }

    const needsUpdate =
      !product.seo ||
      product.seo.metaTitle !== seo.metaTitle ||
      product.seo.metaDescription !== seo.metaDescription ||
      product.seo.socialImageUrl !== seo.socialImageUrl

    if (needsUpdate) {
      tx.patch(product._id, { set: { seo } })
      console.log(`Updating SEO for ${product._id}`)
    }
  }

  await tx.commit()
  console.log(`Backfilled SEO for ${products.length} products`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
