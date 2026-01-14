/**
 * Shopify Cart API utilities
 * Converts numeric variant IDs to Shopify GID format
 */

/**
 * Convert numeric variant ID to Shopify GID format
 * @param variantId - Numeric variant ID
 * @returns GID string (e.g., "gid://shopify/ProductVariant/123456")
 */
export function variantIdToGid(variantId: number): string {
  return `gid://shopify/ProductVariant/${variantId}`
}

/**
 * Extract numeric ID from Shopify GID
 * @param gid - GID string (e.g., "gid://shopify/ProductVariant/123456")
 * @returns Numeric ID or null
 */
export function gidToVariantId(gid: string): number | null {
  const match = gid.match(/ProductVariant\/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}
