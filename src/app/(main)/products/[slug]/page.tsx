import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '../../../../../sanity.client'
import { productQuery, productSeoQuery, productSlugsQuery, siteSettingsQuery } from '../../../../sanity/lib/queries'
import ProductPage from '../../../../components/ProductPage'
import BodyClassProvider from '../../../../components/BodyClassProvider'
import { buildPageMetadata } from '../../../../sanity/lib/metadata'
import { urlFor } from '../../../../sanity/utils/imageUrlBuilder'

export const revalidate = 0

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

function stripHtmlToPlainText(html?: string | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function generateStaticParams() {
  const products = await client.fetch(productSlugsQuery)
  
  return products.map((product: { slug: string }) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params

  const [product, siteSettings] = await Promise.all([
    client.fetch(productSeoQuery, { slug: resolvedParams.slug }),
    client.fetch(siteSettingsQuery),
  ])

  if (!product || product.store?.status !== 'active' || product.store?.isDeleted) {
    return {}
  }

  return buildPageMetadata({
    pageTitle: product.store?.title,
    seo: product.seo ?? {
      metaTitle: product.store?.title ?? null,
      metaDescription: stripHtmlToPlainText(product.store?.descriptionHtml),
      socialImageUrl: product.store?.previewImageUrl ?? null,
    },
    siteSettings,
    buildImageUrl: (image) => urlFor(image).width(1200).height(630).url(),
  })
}

export default async function ProductPageRoute({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  const product = await client.fetch(productQuery, { slug: resolvedParams.slug })

  if (!product || product.store?.status !== 'active' || product.store?.isDeleted) {
    notFound()
  }

  return (
    <>
      <BodyClassProvider 
        pageType="product" 
        slug={product.store?.slug?.current} 
      />
      <ProductPage product={product} />
    </>
  )
}
