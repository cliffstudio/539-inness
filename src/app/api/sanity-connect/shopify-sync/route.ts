// Custom sync handler for Sanity Connect
// This endpoint receives POST requests from Sanity Connect

import { createClient } from "@sanity/client";
import { NextRequest, NextResponse } from "next/server";
import { dataset, projectId, apiVersion } from "@/sanity/env";

const sanity = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_API_TOKEN, // Server-side only, no NEXT_PUBLIC_ prefix needed
  useCdn: false,
});

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN; // e.g. inness-hotel.myshopify.com
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN; // Admin API access token
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

function extractIdFromGid(gid: string | undefined) {
  return gid?.match(/[^\/]+$/i)?.[0];
}

async function shopifyGraphQL(query: string, variables?: Record<string, unknown>) {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error("Shopify credentials not configured");
  }

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function fetchVariantData(variantGid: string) {
  const query = `
    query VariantData($id: ID!) {
      productVariant(id: $id) {
        id
        metafield(namespace: "custom", key: "color_hex") {
          value
          type
        }
        inventoryQuantity
        inventoryPolicy
        inventoryItem {
          tracked
        }
        selectedOptions {
          name
          value
        }
        product {
          status
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query, { id: variantGid });
  const variant = data?.productVariant;
  if (!variant) return null;

  const colorHex = variant.metafield?.value || null;
  
  // Calculate inventory availability
  // If inventory tracking is disabled (tracked = false), the variant is always available
  // If inventory tracking is enabled (tracked = true), check quantity and policy
  const isTracked = variant.inventoryItem?.tracked ?? true; // Default to true if not specified
  const inventoryQuantity = variant.inventoryQuantity ?? 0;
  const inventoryPolicy = variant.inventoryPolicy; // CONTINUE or DENY
  
  // isAvailable logic:
  // - If not tracked: always available
  // - If tracked with CONTINUE policy: always available (backorders allowed)
  // - If tracked with DENY policy: only available if quantity > 0
  const isAvailable = !isTracked 
    ? true 
    : inventoryPolicy === 'CONTINUE' 
      ? true 
      : inventoryQuantity > 0;
  
  // available quantity: only set if inventory is tracked
  const available = isTracked ? inventoryQuantity : undefined;

  // Get status from product (variants inherit product status in Shopify)
  // Map Shopify status to Sanity status format
  const shopifyStatus = variant.product?.status?.toLowerCase();
  const status = shopifyStatus === 'active' ? 'active' 
    : shopifyStatus === 'archived' ? 'archived'
    : shopifyStatus === 'draft' ? 'draft'
    : 'active'; // Default to active if not specified

  // Extract option values from selectedOptions
  // Shopify returns selectedOptions as an array of {name, value}
  // We need to map them to option1, option2, option3 based on position
  const selectedOptions = variant.selectedOptions || [];
  const option1 = selectedOptions[0]?.value || null;
  const option2 = selectedOptions[1]?.value || null;
  const option3 = selectedOptions[2]?.value || null;

  return {
    colorHex,
    status,
    option1,
    option2,
    option3,
    inventory: {
      available,
      isAvailable,
      management: isTracked ? 'shopify' : null,
      policy: inventoryPolicy,
    },
  };
}

async function fetchAllProductVariants(productGid: string) {
  const query = `
    query ProductVariants($id: ID!) {
      product(id: $id) {
        id
        variants(first: 250) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query, { id: productGid });
    if (data?.product?.variants?.edges) {
      return data.product.variants.edges.map((edge: { node: { id: string } }) => edge.node.id);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching all variants for product ${productGid}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanity Connect can batch products in one request
    const products = body.products || [];

    const patches = [];

    // Process each product from the payload
    for (const product of products) {
      if (!product?.id) continue;

      const productId = extractIdFromGid(product.id);
      const sanityProductDocId = `shopifyProduct-${productId}`;

      // Build product patch from payload
      const productPatch: Record<string, unknown> = {};

      // Product-level fields from payload
      if (product.title !== undefined) productPatch["store.title"] = product.title;
      if (product.slug !== undefined || product.handle !== undefined) {
        const slugValue = product.slug || product.handle;
        if (slugValue !== undefined) {
          productPatch["store.slug"] = { current: slugValue };
        }
      }
      // Handle image fields - Sanity Connect may send images in different formats
      // Priority: previewImageUrl > featuredImageUrl > featuredImage.url > image.url > images[0]
      if (product.previewImageUrl !== undefined) {
        productPatch["store.previewImageUrl"] = product.previewImageUrl;
      } else if (product.featuredImageUrl !== undefined) {
        productPatch["store.previewImageUrl"] = product.featuredImageUrl;
      } else if (product.featuredImage?.url !== undefined) {
        productPatch["store.previewImageUrl"] = product.featuredImage.url;
      } else if (product.image?.url !== undefined) {
        productPatch["store.previewImageUrl"] = product.image.url;
      } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Use first image from images array if previewImageUrl is not available
        const firstImage = product.images[0];
        const imageUrl = firstImage?.url || firstImage?.src || (typeof firstImage === 'string' ? firstImage : null);
        if (imageUrl) {
          productPatch["store.previewImageUrl"] = imageUrl;
        }
      }
      if (product.descriptionHtml !== undefined) {
        productPatch["store.descriptionHtml"] = product.descriptionHtml;
      }
      if (product.status !== undefined) productPatch["store.status"] = product.status;
      if (product.isDeleted !== undefined) productPatch["store.isDeleted"] = product.isDeleted;
      if (product.createdAt !== undefined) productPatch["store.createdAt"] = product.createdAt;
      if (product.updatedAt !== undefined) productPatch["store.updatedAt"] = product.updatedAt;
      if (product.id !== undefined) {
        const numericId = extractIdFromGid(product.id);
        if (numericId) productPatch["store.id"] = parseInt(numericId, 10);
      }
      if (product.id !== undefined) productPatch["store.gid"] = product.id;
      if (product.productType !== undefined) productPatch["store.productType"] = product.productType;
      if (product.vendor !== undefined) productPatch["store.vendor"] = product.vendor;
      if (product.tags !== undefined) {
        // Tags can be a string (comma-separated) or array
        productPatch["store.tags"] = Array.isArray(product.tags) 
          ? product.tags.join(', ') 
          : product.tags;
      }
      if (product.options !== undefined) {
        // Add _key properties to options array items (required by Sanity)
        productPatch["store.options"] = Array.isArray(product.options)
          ? product.options.map((option: Record<string, unknown>, index: number) => {
              const optionWithKey: Record<string, unknown> = {
                ...option,
                _key: (option._key as string) || `option-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              };
              // Also add _key to values array if it exists
              if (option.values && Array.isArray(option.values)) {
                optionWithKey.values = option.values.map((value: unknown, valueIndex: number) => {
                  if (typeof value === 'object' && value !== null) {
                    const valueObj = value as Record<string, unknown>;
                    return {
                      ...valueObj,
                      _key: (valueObj._key as string) || `value-${valueIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    };
                  }
                  // If value is a string, wrap it in an object
                  return {
                    _type: 'optionValue',
                    value: value,
                    _key: `value-${valueIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  };
                });
              }
              return optionWithKey;
            })
          : product.options;
      }

      // Calculate priceRange from variants
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants
          .map((v: { price?: string | number }) => {
            const price = v?.price;
            if (price === undefined || price === null) return null;
            const priceValue = typeof price === 'string' 
              ? parseFloat(price) 
              : typeof price === 'number' 
                ? price 
                : null;
            return priceValue !== null && !isNaN(priceValue) ? priceValue : null;
          })
          .filter((p: number | null): p is number => p !== null);

        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          productPatch["store.priceRange"] = {
            minVariantPrice: minPrice,
            maxVariantPrice: maxPrice,
          };
        }
      }

      // Process variants for this product
      // First, fetch existing variants from Sanity to ensure we don't lose any
      // when building the variants array (Sanity Connect may only send changed variants)
      let existingVariantIds: string[] = [];
      try {
        const existingProduct = await sanity.getDocument(sanityProductDocId);
        if (existingProduct?.store?.variants && Array.isArray(existingProduct.store.variants)) {
          existingVariantIds = existingProduct.store.variants
            .map((ref: { _ref?: string }) => ref?._ref)
            .filter((id: string | undefined): id is string => !!id);
        }
      } catch {
        // Product doesn't exist yet, that's fine
        console.log(`Product ${sanityProductDocId} doesn't exist yet, will create`);
      }

      // Collect variant document IDs to update product's variants array
      const variantDocIds: string[] = [];
      // Track which variants we've processed from the payload
      const processedVariantIds = new Set<string>();
      
      // Process variants from payload
      for (const variant of product.variants || []) {
        if (!variant?.id) continue;

        const variantId = extractIdFromGid(variant.id);
        if (!variantId) continue; // Skip if we can't extract ID
        
        const sanityVariantDocId = `shopifyProductVariant-${variantId}`;

        // Build variant patch from payload
        const variantPatch: Record<string, unknown> = {};

        // Variant-level fields from payload
        if (variant.title !== undefined) variantPatch["store.title"] = variant.title;
        if (variant.sku !== undefined) variantPatch["store.sku"] = variant.sku;
        if (variant.status !== undefined) variantPatch["store.status"] = variant.status;
        if (variant.isDeleted !== undefined) variantPatch["store.isDeleted"] = variant.isDeleted;
        if (variant.createdAt !== undefined) variantPatch["store.createdAt"] = variant.createdAt;
        if (variant.updatedAt !== undefined) variantPatch["store.updatedAt"] = variant.updatedAt;
        if (variant.id !== undefined) {
          const numericId = extractIdFromGid(variant.id);
          if (numericId) variantPatch["store.id"] = parseInt(numericId, 10);
        }
        if (variant.id !== undefined) variantPatch["store.gid"] = variant.id;
        // Product ID and GID from parent product
        if (product.id !== undefined) {
          const productNumericId = extractIdFromGid(product.id);
          if (productNumericId) variantPatch["store.productId"] = parseInt(productNumericId, 10);
          variantPatch["store.productGid"] = product.id;
        }
        if (variant.price !== undefined) {
          const priceValue = typeof variant.price === 'string' 
            ? parseFloat(variant.price) 
            : typeof variant.price === 'number' 
              ? variant.price 
              : null;
          if (priceValue !== null && !isNaN(priceValue)) {
            variantPatch["store.price"] = priceValue;
          }
        }
        if (variant.compareAtPrice !== undefined) {
          const compareAtPriceValue = typeof variant.compareAtPrice === 'string' 
            ? parseFloat(variant.compareAtPrice) 
            : typeof variant.compareAtPrice === 'number' 
              ? variant.compareAtPrice 
              : null;
          if (compareAtPriceValue !== null && !isNaN(compareAtPriceValue)) {
            variantPatch["store.compareAtPrice"] = compareAtPriceValue;
          }
        }
        // Handle image fields - Sanity Connect may send images in different formats
        // Priority: variant.previewImageUrl > variant.imageUrl > variant.image.url > variant.images[0] > product.images[0]
        if (variant.previewImageUrl !== undefined) {
          variantPatch["store.previewImageUrl"] = variant.previewImageUrl;
        } else if (variant.imageUrl !== undefined) {
          variantPatch["store.previewImageUrl"] = variant.imageUrl;
        } else if (variant.image?.url !== undefined) {
          variantPatch["store.previewImageUrl"] = variant.image.url;
        } else if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
          // Use first image from variant images array if previewImageUrl is not available
          const firstImage = variant.images[0];
          const imageUrl = firstImage?.url || firstImage?.src || (typeof firstImage === 'string' ? firstImage : null);
          if (imageUrl) {
            variantPatch["store.previewImageUrl"] = imageUrl;
          }
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          // Fallback to product images if variant doesn't have its own image
          const firstImage = product.images[0];
          const imageUrl = firstImage?.url || firstImage?.src || (typeof firstImage === 'string' ? firstImage : null);
          if (imageUrl) {
            variantPatch["store.previewImageUrl"] = imageUrl;
          }
        }
        if (variant.option1 !== undefined) variantPatch["store.option1"] = variant.option1;
        if (variant.option2 !== undefined) variantPatch["store.option2"] = variant.option2;
        if (variant.option3 !== undefined) variantPatch["store.option3"] = variant.option3;
        // Shop details if available
        if (variant.shop !== undefined) {
          variantPatch["store.shop"] = variant.shop;
        } else if (SHOPIFY_DOMAIN) {
          // Fallback: set shop domain from env if not in payload
          variantPatch["store.shop"] = { domain: SHOPIFY_DOMAIN };
        }

        // Fetch colorHex, inventory, and status from Shopify API
        try {
          const variantData = await fetchVariantData(variant.id);
          if (variantData) {
            variantPatch["store.colorHex"] = variantData.colorHex;
            variantPatch["store.inventory"] = variantData.inventory;
            // Always set status (required field) - use from API if not in payload
            if (variantData.status) {
              variantPatch["store.status"] = variantData.status;
            }
          }
        } catch (error) {
          console.error(`Error fetching data for variant ${variant.id}:`, error);
          // Continue even if API fetch fails - we still want to update other fields
        }
        
        // Ensure status is always set (required field)
        // Priority: payload status > API status > default to 'active'
        if (variantPatch["store.status"] === undefined) {
          variantPatch["store.status"] = variant.status || 'active';
        }

        // Always create/update variant document, even if patch is minimal
        // This ensures new variants are created even if they have minimal data
        if (Object.keys(variantPatch).length > 0) {
          patches.push({
            id: sanityVariantDocId,
            patch: { set: variantPatch },
          });
        } else {
          // Even if no fields to update, ensure variant exists with at least ID and product reference
          const productNumericId = product.id ? extractIdFromGid(product.id) : null;
          patches.push({
            id: sanityVariantDocId,
            patch: { 
              set: {
                "store.id": parseInt(variantId, 10),
                "store.gid": variant.id,
                ...(productNumericId ? { "store.productId": parseInt(productNumericId, 10) } : {}),
                ...(product.id ? { "store.productGid": product.id } : {}),
              }
            },
          });
        }
        // Add variant document ID to the array for product reference
        variantDocIds.push(sanityVariantDocId);
        processedVariantIds.add(sanityVariantDocId);
      }

      // If we have fewer variants in payload than exist in Sanity, or if product is new,
      // fetch all variants from Shopify to ensure we sync everything
      // This handles cases where Sanity Connect only sends changed variants
      if (product.id && (product.variants?.length || 0) < existingVariantIds.length) {
        try {
          const allShopifyVariantGids = await fetchAllProductVariants(product.id);
          console.log(`Fetched ${allShopifyVariantGids.length} variants from Shopify (payload had ${product.variants?.length || 0})`);
          
          // Process variants from Shopify that weren't in the payload
          for (const variantGid of allShopifyVariantGids) {
            const variantId = extractIdFromGid(variantGid);
            const sanityVariantDocId = `shopifyProductVariant-${variantId}`;
            
            // Only process if we haven't already processed this variant
            if (!processedVariantIds.has(sanityVariantDocId)) {
              // Fetch full variant data from Shopify API
              try {
                const variantData = await fetchVariantData(variantGid);
                if (!variantId) continue;
                
                const variantPatch: Record<string, unknown> = {
                  "store.id": parseInt(variantId, 10),
                  "store.gid": variantGid,
                };
                
                if (product.id) {
                  const productNumericId = extractIdFromGid(product.id);
                  if (productNumericId) variantPatch["store.productId"] = parseInt(productNumericId, 10);
                  variantPatch["store.productGid"] = product.id;
                }
                
                if (variantData) {
                  variantPatch["store.colorHex"] = variantData.colorHex;
                  variantPatch["store.inventory"] = variantData.inventory;
                  // Always set status (required field)
                  if (variantData.status) {
                    variantPatch["store.status"] = variantData.status;
                  }
                  // Set option values if available
                  if (variantData.option1 !== null && variantData.option1 !== undefined) {
                    variantPatch["store.option1"] = variantData.option1;
                  }
                  if (variantData.option2 !== null && variantData.option2 !== undefined) {
                    variantPatch["store.option2"] = variantData.option2;
                  }
                  if (variantData.option3 !== null && variantData.option3 !== undefined) {
                    variantPatch["store.option3"] = variantData.option3;
                  }
                }
                
                // Ensure status is always set (required field) - default to 'active' if not available
                if (variantPatch["store.status"] === undefined) {
                  variantPatch["store.status"] = 'active';
                }
                
                patches.push({
                  id: sanityVariantDocId,
                  patch: { set: variantPatch },
                });
                
                variantDocIds.push(sanityVariantDocId);
                processedVariantIds.add(sanityVariantDocId);
              } catch (error) {
                console.error(`Error fetching data for variant ${variantGid}:`, error);
                // Still add to array even if we can't fetch full data
                variantDocIds.push(sanityVariantDocId);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching all variants from Shopify:`, error);
        }
      }

      // Update product's variants array with references to all variants
      // Merge variants from payload with existing variants to ensure we don't lose any
      // This ensures new variants are linked to the product, and existing ones aren't removed
      const allVariantIds = new Set([
        ...variantDocIds, // Variants from current payload (newly added or updated)
        ...existingVariantIds.filter(id => id.startsWith('shopifyProductVariant-')) // Existing variants not in payload
      ]);
      
      if (allVariantIds.size > 0) {
        // Add _key properties to variant references (required by Sanity for array items)
        productPatch["store.variants"] = Array.from(allVariantIds).map((variantId, index) => ({
          _type: 'reference',
          _ref: variantId,
          _weak: true,
          _key: `variant-${index}-${variantId}`,
        }));
      }

      if (Object.keys(productPatch).length > 0) {
        patches.push({
          id: sanityProductDocId,
          patch: { set: productPatch },
        });
      }
    }

    // Apply all patches in a transaction
    // Use createIfNotExists for variants/products that might not exist yet
    if (patches.length > 0) {
      try {
        const tx = sanity.transaction();
        for (const p of patches) {
          // Check if this is a variant or product document
          const isVariant = p.id.startsWith('shopifyProductVariant-');
          const isProduct = p.id.startsWith('shopifyProduct-');
          
          if (isVariant) {
            // For variants, create the document if it doesn't exist, then patch
            tx.createIfNotExists({
              _id: p.id,
              _type: 'productVariant',
              store: {},
            });
            tx.patch(p.id, (patch) => patch.set(p.patch.set));
          } else if (isProduct) {
            // For products, create the document if it doesn't exist, then patch
            tx.createIfNotExists({
              _id: p.id,
              _type: 'product',
              store: {},
            });
            tx.patch(p.id, (patch) => patch.set(p.patch.set));
          } else {
            // Fallback to regular patch
            tx.patch(p.id, (patch) => patch.set(p.patch.set));
          }
        }
        await tx.commit();
        console.log(`Successfully patched ${patches.length} documents`);
      } catch (txError) {
        console.error('Transaction error:', txError);
        // Log details about which patches failed
        console.error(`Failed to apply ${patches.length} patches`);
        throw txError;
      }
    }

    return NextResponse.json({ message: "OK", patched: patches.length }, { status: 200 });
  } catch (err) {
    console.error(err);
    // Still return non-200 so Sanity Connect retries (per docs)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}