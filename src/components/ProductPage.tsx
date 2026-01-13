/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useMemo } from 'react'
import { PortableTextBlock } from '@portabletext/react'
import { getPriceRange } from '../sanity/utils/getPriceRange'
import { useBasket } from '../contexts/BasketContext'

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
  _id: string
  store?: {
    id?: number
    gid?: string
    title?: string
    price?: number
    sku?: string
    previewImageUrl?: string
    option1?: string
    option2?: string
    option3?: string
    inventory?: {
      available?: number
      isAvailable?: boolean
    }
  }
}

interface Product {
  _id: string
  body?: PortableTextBlock[]
  store?: {
    title?: string
    slug?: {
      current?: string
    }
    previewImageUrl?: string
    descriptionHtml?: string
    priceRange?: {
      minVariantPrice?: number
      maxVariantPrice?: number
    }
    status?: string
    isDeleted?: boolean
    id?: number
    gid?: string
    options?: ProductOption[]
    variants?: ProductVariant[]
  }
}

interface ProductPageProps {
  product: Product
}

// Helper function to extract value string from OptionValue
const getValueString = (optionValue: OptionValue | null | undefined): string => {
  if (!optionValue) return ''
  return typeof optionValue === 'string' ? optionValue : optionValue.value || ''
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  const { addToBasket } = useBasket()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Initialize selected options with first available values
  React.useEffect(() => {
    if (product.store && product.store.options && product.store.options.length > 0) {
      const initialOptions: Record<string, string> = {}
      product.store.options.forEach((option) => {
        if (option.name && option.values && option.values.length > 0) {
          // Use lowercase key to match how we access it later
          const optionName = option.name.toLowerCase()
          initialOptions[optionName] = getValueString(option.values[0])
        }
      })
      setSelectedOptions(initialOptions)
    }
  }, [product.store])

  // Find the variant that matches the selected options
  const selectedVariant = useMemo(() => {
    if (!product.store?.variants || product.store.variants.length === 0) {
      return null
    }

    // If no options, return first variant
    if (!product.store.options || product.store.options.length === 0) {
      return product.store.variants[0]
    }

    // Find variant matching selected options
    return product.store.variants.find((variant) => {
      if (!variant.store || !product.store) return false

      const optionNames = product.store.options?.map((opt) => opt.name?.toLowerCase()) || []
      
      // Check if variant matches all selected options
      let matches = true
      if (optionNames[0] && selectedOptions[optionNames[0]]) {
        matches = matches && variant.store.option1 === selectedOptions[optionNames[0]]
      }
      if (optionNames[1] && selectedOptions[optionNames[1]]) {
        matches = matches && variant.store.option2 === selectedOptions[optionNames[1]]
      }
      if (optionNames[2] && selectedOptions[optionNames[2]]) {
        matches = matches && variant.store.option3 === selectedOptions[optionNames[2]]
      }

      return matches
    }) || product.store.variants[0]
  }, [product.store, selectedOptions])

  const priceText = selectedVariant?.store?.price
    ? `$${selectedVariant.store.price.toFixed(2)}`
    : product.store?.priceRange && 
      typeof product.store.priceRange.minVariantPrice !== 'undefined'
      ? getPriceRange({
          minVariantPrice: product.store.priceRange.minVariantPrice,
          maxVariantPrice: product.store.priceRange.maxVariantPrice ?? product.store.priceRange.minVariantPrice,
        })
      : null

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const handleAddToBasket = () => {
    if (!selectedVariant?.store?.id || !product.store?.gid) {
      return
    }

    // Check if variant is available - use same logic as availability check
    const inventory = selectedVariant.store.inventory
    let isAvailable = true
    
    if (inventory) {
      // Variant is available if isAvailable is true OR available quantity > 0
      isAvailable = inventory.isAvailable === true || (inventory.available !== undefined && inventory.available > 0)
    }

    if (!isAvailable) {
      alert('This variant is currently out of stock')
      return
    }

    addToBasket({
      variantId: selectedVariant.store.id,
      productGid: product.store.gid,
      title: product.store.title || 'Product',
      price: selectedVariant.store.price || 0,
      imageUrl: selectedVariant.store.previewImageUrl || product.store.previewImageUrl,
      variantTitle: selectedVariant.store.title,
      sku: selectedVariant.store.sku,
    })
  }

  // Check if variant is available - use same logic as ProductSection
  const isVariantAvailable = (() => {
    if (!selectedVariant?.store?.inventory) {
      // If no inventory data, assume it's available (inventory tracking might be disabled)
      return true
    }
    
    const inventory = selectedVariant.store.inventory
    
    // If isAvailable is explicitly false, variant is not available
    if (inventory.isAvailable === false) {
      return false
    }
    
    // If isAvailable is true, variant is available
    if (inventory.isAvailable === true) {
      return true
    }
    
    // If isAvailable is undefined, check available quantity
    // If available is undefined, assume available (inventory tracking disabled)
    if (inventory.available === undefined) {
      return true
    }
    
    // If available is defined, check if it's > 0
    return inventory.available > 0
  })()

  const displayImageUrl = selectedVariant?.store?.previewImageUrl || product.store?.previewImageUrl

  return (
    <article className="product-page">
      <div className="hero-section layout-2 h-pad">
        {displayImageUrl && (
          <div className="hero-image relative out-of-opacity">
            <div className="fill-space-image-wrap media-wrap">
              <img 
                data-src={displayImageUrl}
                alt=""
                className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          </div>
        )}

        <div className="hero-content out-of-opacity">
          <div>
            {product.store?.title && (
              <h3 className="product-title">{product.store.title}</h3>
            )}

            {product.store?.descriptionHtml && (
              <div 
                className="product-description"
                dangerouslySetInnerHTML={{ __html: product.store.descriptionHtml }}
              />
            )}
          </div>

          {(() => {
            // Filter out meaningless options (e.g., "Title" with only "Default Title")
            const meaningfulOptions = product.store?.options?.filter((option) => {
              if (!option.name || !option.values || option.values.length === 0) {
                return false
              }
              
              // Check if we have at least one valid value (string or object with value)
              const hasValidValue = option.values.some((val) => {
                if (!val) return false
                if (typeof val === 'string') return val.trim().length > 0
                if (typeof val === 'object' && val.value) return val.value.trim().length > 0
                return false
              })
              
              if (!hasValidValue) {
                return false
              }
              
              // Get first valid value for checking "Default Title"
              const firstValidValue = option.values.find((val) => {
                if (!val) return false
                if (typeof val === 'string') return val.trim().length > 0
                if (typeof val === 'object' && val.value) return val.value.trim().length > 0
                return false
              })
              
              if (!firstValidValue) {
                return false
              }
              
              // Hide "Title" option if it only has "Default Title" as the value
              const optionNameLower = option.name.toLowerCase()
              const firstValue = getValueString(firstValidValue)
              if (optionNameLower === 'title' && option.values.length === 1 && firstValue === 'Default Title') {
                return false
              }
              
              // Hide any option that only has "Default Title" as the value
              if (option.values.length === 1 && firstValue === 'Default Title') {
                return false
              }
              
              return true
            }) || []

            // Only show options if there are meaningful options
            if (meaningfulOptions.length === 0) {
              return null
            }

            return (
              <div className="product-options">
                {meaningfulOptions.map((option) => {
                  if (!option.name || !option.values || option.values.length === 0) {
                    return null
                  }

                  const optionName = option.name.toLowerCase()
                  // Find first valid value (skip null/undefined entries)
                  const firstValidValue = option.values.find((val) => val !== null && val !== undefined)
                  const firstValueString = firstValidValue ? getValueString(firstValidValue) : ''
                  const selectedValue = selectedOptions[optionName] || firstValueString
                  const isColorOption = optionName === 'colour' || optionName === 'color'

                  return (
                    <div key={option.name} className="product-option">
                      {isColorOption && (
                        <label className="product-option-label">
                          {option.name}: {selectedValue}
                        </label>
                      )}
                      <div className="product-option-values">
                        {isColorOption ? (
                          // Color swatches
                          <div className="product-option-swatches">
                            {option.values.map((optionValue, index) => {
                              if (!optionValue) return null
                              const value = getValueString(optionValue)
                              if (!value) return null
                              const isSelected = selectedValue === value
                              return (
                                <button
                                  key={typeof optionValue === 'object' && optionValue._key ? optionValue._key : `${value}-${index}`}
                                  type="button"
                                  className={`product-option-swatch ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleOptionChange(optionName, value)}
                                  aria-label={`Select ${value}`}
                                  title={value}
                                />
                              )
                            })}
                          </div>
                        ) : (
                          // Size or other option buttons
                          <div className="product-option-buttons">
                            {option.values.map((optionValue, index) => {
                              if (!optionValue) return null
                              const value = getValueString(optionValue)
                              if (!value) return null
                              const isSelected = selectedValue === value
                              return (
                                <button
                                  key={typeof optionValue === 'object' && optionValue._key ? optionValue._key : `${value}-${index}`}
                                  type="button"
                                  className={`product-option-button ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleOptionChange(optionName, value)}
                                >
                                  {value}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          <div>
            {priceText && (
              <div className="product-price body-big">{priceText}</div>
            )}

            {/* Add to Basket button */}
            <button
              type="button"
              className="product-add-to-basket button button--orange"
              onClick={handleAddToBasket}
              disabled={!isVariantAvailable || !selectedVariant}
            >
              {!isVariantAvailable ? 'Out of Stock' : 'Add to basket'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}


export default ProductPage
