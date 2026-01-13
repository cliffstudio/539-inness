const SHOPIFY_STORE_URL = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || 'https://inness-hotel.myshopify.com'

export function productUrl(id: number | string): string {
  return `${SHOPIFY_STORE_URL}/admin/products/${id}`
}

export function collectionUrl(id: number | string): string {
  return `${SHOPIFY_STORE_URL}/admin/collections/${id}`
}

export function productVariantUrl(productId: number | string, variantId: number | string): string {
  return `${SHOPIFY_STORE_URL}/admin/products/${productId}/variants/${variantId}`
}
