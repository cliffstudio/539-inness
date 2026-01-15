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

  return {
    colorHex,
    inventory: {
      available,
      isAvailable,
      management: isTracked ? 'shopify' : null,
      policy: inventoryPolicy,
    },
  };
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
        productPatch["store.options"] = product.options;
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
      // Collect variant document IDs to update product's variants array
      const variantDocIds: string[] = [];
      
      for (const variant of product.variants || []) {
        if (!variant?.id) continue;

        const variantId = extractIdFromGid(variant.id);
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

        // Fetch colorHex and inventory from Shopify API
        try {
          const variantData = await fetchVariantData(variant.id);
          if (variantData) {
            variantPatch["store.colorHex"] = variantData.colorHex;
            variantPatch["store.inventory"] = variantData.inventory;
          }
        } catch (error) {
          console.error(`Error fetching data for variant ${variant.id}:`, error);
          // Continue even if API fetch fails - we still want to update other fields
        }

        if (Object.keys(variantPatch).length > 0) {
          patches.push({
            id: sanityVariantDocId,
            patch: { set: variantPatch },
          });
          // Add variant document ID to the array for product reference
          variantDocIds.push(sanityVariantDocId);
        }
      }

      // Update product's variants array with references to all variants
      // This ensures new variants are linked to the product
      if (variantDocIds.length > 0) {
        productPatch["store.variants"] = variantDocIds.map((variantId) => ({
          _type: 'reference',
          _ref: variantId,
          _weak: true,
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