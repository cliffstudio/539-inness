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
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

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
      if (product.slug !== undefined) {
        productPatch["store.slug"] = { current: product.slug };
      }
      if (product.previewImageUrl !== undefined) {
        productPatch["store.previewImageUrl"] = product.previewImageUrl;
      }
      if (product.descriptionHtml !== undefined) {
        productPatch["store.descriptionHtml"] = product.descriptionHtml;
      }
      if (product.status !== undefined) productPatch["store.status"] = product.status;
      if (product.isDeleted !== undefined) productPatch["store.isDeleted"] = product.isDeleted;
      if (product.id !== undefined) {
        const numericId = extractIdFromGid(product.id);
        if (numericId) productPatch["store.id"] = parseInt(numericId, 10);
      }
      if (product.id !== undefined) productPatch["store.gid"] = product.id;
      if (product.options !== undefined) {
        productPatch["store.options"] = product.options;
      }

      // Calculate priceRange from variants
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants
          .map((v: { price?: string }) => {
            const price = v?.price;
            return price ? parseFloat(price) : null;
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

      if (Object.keys(productPatch).length > 0) {
        patches.push({
          id: sanityProductDocId,
          patch: { set: productPatch },
        });
      }

      // Process variants for this product
      for (const variant of product.variants || []) {
        if (!variant?.id) continue;

        const variantId = extractIdFromGid(variant.id);
        const sanityVariantDocId = `shopifyProductVariant-${variantId}`;

        // Build variant patch from payload
        const variantPatch: Record<string, unknown> = {};

        // Variant-level fields from payload
        if (variant.title !== undefined) variantPatch["store.title"] = variant.title;
        if (variant.sku !== undefined) variantPatch["store.sku"] = variant.sku;
        if (variant.id !== undefined) {
          const numericId = extractIdFromGid(variant.id);
          if (numericId) variantPatch["store.id"] = parseInt(numericId, 10);
        }
        if (variant.id !== undefined) variantPatch["store.gid"] = variant.id;
        if (variant.price !== undefined) {
          variantPatch["store.price"] = parseFloat(variant.price);
        }
        if (variant.previewImageUrl !== undefined) {
          variantPatch["store.previewImageUrl"] = variant.previewImageUrl;
        }
        if (variant.option1 !== undefined) variantPatch["store.option1"] = variant.option1;
        if (variant.option2 !== undefined) variantPatch["store.option2"] = variant.option2;
        if (variant.option3 !== undefined) variantPatch["store.option3"] = variant.option3;

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
        }
      }
    }

    // Apply all patches in a transaction
    if (patches.length > 0) {
      const tx = sanity.transaction();
      for (const p of patches) {
        tx.patch(p.id, (patch) => patch.set(p.patch.set));
      }
      await tx.commit();
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
