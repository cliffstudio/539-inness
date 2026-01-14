'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react'
import { getPriceRange } from '../sanity/utils/getPriceRange'

interface PriceRange {
  minVariantPrice?: number
  maxVariantPrice?: number
}

interface Inventory {
  available?: number
  isAvailable?: boolean
}

type OptionValue = string | {
  _type?: string
  _key?: string
  value: string
}

interface ProductOption {
  name?: string
  values?: OptionValue[]
}

interface ProductVariant {
  store?: {
    inventory?: Inventory
    option1?: string
    option2?: string
    option3?: string
    colorHex?: string
  }
}

interface Product {
  _id: string
  store?: {
    title?: string
    slug?: {
      current?: string
    }
    previewImageUrl?: string
    priceRange?: PriceRange
    status?: string
    isDeleted?: boolean
    options?: ProductOption[]
    variants?: ProductVariant[]
  }
}

interface ProductSectionProps {
  id?: string
  heading?: string
  products?: Product[]
}

export default function ProductSection({ 
  id,
  products = [],
}: ProductSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleImageLoad = (img: HTMLImageElement) => {
      const mediaWrap = img.closest('.media-wrap')
      if (mediaWrap) {
        const loadingOverlay = mediaWrap.querySelector('.loading-overlay') as HTMLElement
        if (loadingOverlay) {
          loadingOverlay.classList.add('hidden')
        }
      }
    }

    // Handle images that are already loaded
    const images = section.querySelectorAll('img')
    images.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        handleImageLoad(img)
      } else {
        img.addEventListener('load', () => handleImageLoad(img), { once: true })
      }
    })

    // Also handle new images that might be added (for dynamic updates)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const img = (node as Element).querySelector?.('img') || (node as Element).matches?.('img') ? node as HTMLImageElement : null
            if (img) {
              if (img.complete && img.naturalHeight !== 0) {
                handleImageLoad(img)
              } else {
                img.addEventListener('load', () => handleImageLoad(img), { once: true })
              }
            }
          }
        })
      })
    })

    observer.observe(section, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [products])

  if (!products || products.length === 0) {
    return null
  }

  // Filter out deleted or inactive products (include both active and sold-out)
  const activeProducts = products.filter(
    (product) => 
      product.store && 
      (product.store.status === 'active' || product.store.status === 'sold-out') && 
      !product.store.isDeleted
  )

  if (activeProducts.length === 0) {
    return null
  }

  // Get product URL from slug
  const getProductUrl = (slug?: { current?: string }) => {
    if (!slug?.current) return '#'
    return `/products/${slug.current}`
  }

  // Helper function to get value string from OptionValue
  const getValueString = (optionValue: OptionValue | null | undefined): string => {
    if (!optionValue) return ''
    return typeof optionValue === 'string' ? optionValue : optionValue.value || ''
  }

  // Check if product is sold out based on inventory
  const isSoldOut = (product: Product): boolean => {
    if (!product.store?.variants || product.store.variants.length === 0) {
      return false
    }
    
    // Check if any variant has available inventory
    const hasAvailableInventory = product.store.variants.some((variant) => {
      const inventory = variant.store?.inventory
      if (!inventory) {
        // If no inventory data, assume it's available (inventory tracking might be disabled)
        return true
      }
      
      // Variant is available if isAvailable is true OR available quantity > 0
      return inventory.isAvailable === true || (inventory.available !== undefined && inventory.available > 0)
    })
    
    // Product is sold out if no variants have available inventory
    return !hasAvailableInventory
  }

  // Get color variants for a product
  const getColorVariants = (product: Product): Array<{ colorValue: string; colorHex?: string }> => {
    if (!product.store?.options || !product.store?.variants) {
      return []
    }

    // Find the color option
    const colorOption = product.store.options.find(
      (option) => option.name?.toLowerCase() === 'colour' || option.name?.toLowerCase() === 'color'
    )

    if (!colorOption || !colorOption.values || colorOption.values.length === 0) {
      return []
    }

    // Get the index of the color option
    const optionNames = product.store.options.map((opt) => opt.name?.toLowerCase()) || []
    const colorOptionIndex = optionNames.findIndex(
      (name) => name === 'colour' || name === 'color'
    )

    if (colorOptionIndex === -1) {
      return []
    }

    // Map each color value to its variant and colorHex
    const colorVariants: Array<{ colorValue: string; colorHex?: string }> = []
    
    colorOption.values.forEach((optionValue) => {
      const colorValue = getValueString(optionValue)
      if (!colorValue) return

      // Find a variant that matches this color value
      const variant = product.store?.variants?.find((v) => {
        if (!v.store) return false

        if (colorOptionIndex === 0) {
          return v.store.option1 === colorValue
        } else if (colorOptionIndex === 1) {
          return v.store.option2 === colorValue
        } else if (colorOptionIndex === 2) {
          return v.store.option3 === colorValue
        }
        return false
      })

      colorVariants.push({
        colorValue,
        colorHex: variant?.store?.colorHex,
      })
    })

    return colorVariants
  }

  return (
    <section ref={sectionRef} id={id} className="product-section h-pad">
      {activeProducts.map((product) => {
        const productUrl = getProductUrl(product.store?.slug)
        const priceText = product.store?.priceRange && 
          typeof product.store.priceRange.minVariantPrice !== 'undefined'
          ? getPriceRange({
              minVariantPrice: product.store.priceRange.minVariantPrice,
              maxVariantPrice: product.store.priceRange.maxVariantPrice ?? product.store.priceRange.minVariantPrice,
            })
          : null

        return (
          <a key={product._id} href={productUrl} className="product-item out-of-opacity">
            {product.store?.previewImageUrl && (
              <div className="media-wrap">
                <img 
                  data-src={`${product.store.previewImageUrl}`}
                  alt=""
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />

                {isSoldOut(product) && (
                  <div className="button-wrap button-wrap--overlay-media">
                    <div className="sold-out button button--black">Sold out</div>
                  </div>
                )}

                {(() => {
                  const colorVariants = getColorVariants(product)
                  if (colorVariants.length === 0) return null

                  return (
                    <div className="product-section-swatches">
                      {colorVariants.map((variant, index) => (
                        <div
                          key={`${variant.colorValue}-${index}`}
                          className="product-section-swatch"
                          style={variant.colorHex ? { backgroundColor: variant.colorHex } : undefined}
                          title={variant.colorValue}
                          aria-label={variant.colorValue}
                        />
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="product-content">
              {product.store?.title && (
                <div className="product-title body-big">{product.store.title}</div>
              )}

              {priceText && (
                <div className="product-price">{priceText}</div>
              )}
            </div>
          </a>
        )
      })}
    </section>
  )
}
