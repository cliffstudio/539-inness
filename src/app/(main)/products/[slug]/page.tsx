import { notFound } from 'next/navigation'
import { client } from '../../../../../sanity.client'
import { productQuery, productSlugsQuery } from '../../../../sanity/lib/queries'
import ProductPage from '../../../../components/ProductPage'
import BodyClassProvider from '../../../../components/BodyClassProvider'

export const revalidate = 0

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const products = await client.fetch(productSlugsQuery)
  
  return products.map((product: { slug: string }) => ({
    slug: product.slug,
  }))
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
