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

    // Collect variant gids from payload
    const variantGids = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        if (v?.id) variantGids.push(v.id); // v.id is a Shopify GID in the payload
      }
    }

    // Fetch data for each variant (simple sequential; you can add limited concurrency if needed)
    const patches = [];
    for (const variantGid of variantGids) {
      const variantId = extractIdFromGid(variantGid); // numeric ID string
      const sanityVariantDocId = `shopifyProductVariant-${variantId}`;

      try {
        const variantData = await fetchVariantData(variantGid);
        
        if (!variantData) {
          console.warn(`No data returned for variant ${variantGid}`);
          continue;
        }

        // Patch into your existing variant doc shape
        // Update both colorHex and inventory to ensure stock is always accurate
        patches.push({
          id: sanityVariantDocId,
          patch: {
            set: {
              "store.colorHex": variantData.colorHex,
              "store.inventory": variantData.inventory,
            },
          },
        });
        
        // Log inventory updates for debugging
        console.log(`Updated variant ${variantId}: inventory=${JSON.stringify(variantData.inventory)}`);
      } catch (error) {
        console.error(`Error fetching data for variant ${variantGid}:`, error);
        // Continue with other variants even if one fails
      }
    }

    // Apply patches in a transaction
    const tx = sanity.transaction();
    for (const p of patches) {
      tx.patch(p.id, (patch) => patch.set(p.patch.set));
    }
    await tx.commit();

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
