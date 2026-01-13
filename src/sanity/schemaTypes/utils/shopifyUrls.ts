const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL?.replace('https://', '').replace('http://', '') || 'inness-hotel.myshopify.com'

export const collectionUrl = (collectionId: number) => {
  if (!SHOPIFY_STORE_DOMAIN) {
    return null
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/admin/collections/${collectionId}`
}

export const productUrl = (productId: number) => {
  if (!SHOPIFY_STORE_DOMAIN) {
    return null
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${productId}`
}

export const productVariantUrl = (productId: number, productVariantId: number) => {
  if (!SHOPIFY_STORE_DOMAIN) {
    return null
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/admin/products/${productId}/variants/${productVariantId}`
}
