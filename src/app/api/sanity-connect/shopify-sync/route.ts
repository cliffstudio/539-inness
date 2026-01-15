// app/api/sanity-connect/route.ts
import { createClient } from "@sanity/client";
import { NextRequest, NextResponse } from "next/server";
import { dataset, projectId, apiVersion } from "@/sanity/env";

import { GraphQLClient } from "graphql-request";
import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE_PRODUCT_VARIANT =
  process.env.UUID_NAMESPACE_PRODUCT_VARIANT;

const sanity = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Admin API
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

// Storefront
const SHOPIFY_API_ENDPOINT = process.env.SHOPIFY_API_ENDPOINT;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

function idFromGid(gid: string | undefined) {
  return gid?.match(/[^\/]+$/i)?.[0];
}

/** ----------------------------
 *  Shopify Admin GraphQL
 *  ---------------------------- */
async function shopifyAdminGraphQL(query: string, variables?: Record<string, unknown>) {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error("Shopify Admin credentials not configured");
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
    throw new Error(`Shopify Admin GraphQL failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Shopify Admin GraphQL errors: ${JSON.stringify(json.errors)}`);
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
        inventoryItem { tracked }
      }
    }
  `;

  const data = await shopifyAdminGraphQL(query, { id: variantGid });
  const variant = data?.productVariant;
  if (!variant) return null;

  const colorHex = variant.metafield?.value || null;

  const isTracked = variant.inventoryItem?.tracked ?? true;
  const inventoryQuantity = variant.inventoryQuantity ?? 0;
  const inventoryPolicy = variant.inventoryPolicy; // CONTINUE or DENY

  const isAvailable = !isTracked
    ? true
    : inventoryPolicy === "CONTINUE"
      ? true
      : inventoryQuantity > 0;

  const available = isTracked ? inventoryQuantity : undefined;

  return {
    colorHex,
    inventory: {
      available,
      isAvailable,
      management: isTracked ? "shopify" : null,
      policy: inventoryPolicy,
    },
  };
}

/** ----------------------------
 *  Shopify Storefront fetch
 *  ---------------------------- */
function getStorefrontClient() {
  if (!SHOPIFY_API_ENDPOINT || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error("Shopify Storefront credentials not configured");
  }

  return new GraphQLClient(SHOPIFY_API_ENDPOINT, {
    headers: {
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  });
}

const STOREFRONT_PRODUCT_QUERY = /* GraphQL */ `
  query ProductById($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      descriptionHtml
      vendor
      productType
      tags
      createdAt
      updatedAt

      featuredImage { url }
      images(first: 1) { nodes { url } }

      options {
        id
        name
        values
      }

      requiresSellingPlan
      sellingPlanGroups(first: 10) {
        edges {
          node {
            id
            name
            sellingPlans(first: 50) {
              edges {
                node {
                  id
                  name
                  priceAdjustments {
                    adjustmentValue {
                      __typename
                      ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
                      ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount }
                      ... on SellingPlanFixedPriceAdjustment { price { amount } }
                    }
                  }
                }
              }
            }
          }
        }
      }

      variants(first: 250) {
        nodes {
          id
          title
          sku
          availableForSale
          price { amount }
          compareAtPrice { amount }
          image { url }
          selectedOptions { name value }
          product { id }
        }
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    if (!UUID_NAMESPACE_PRODUCT_VARIANT) {
      throw new Error("UUID_NAMESPACE_PRODUCT_VARIANT environment variable is not configured");
    }

    const requestData = await request.json();
    const action: string = requestData?.action || "update";

    switch (action) {
      case "create":
      case "update":
      case "sync":
        break;
      case "delete":
        // Optional: implement delete handling (productIds/collectionIds). :contentReference[oaicite:3]{index=3}
        return NextResponse.json({ message: "OK (delete not implemented here)" }, { status: 200 });
      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    const products = Array.isArray(requestData?.products) ? requestData.products : [];
    if (products.length === 0) {
      return NextResponse.json({ message: "OK", patched: 0 }, { status: 200 });
    }

    const storefront = getStorefrontClient();
    const tx = sanity.transaction();

    let patched = 0;

    for (const incoming of products) {
      const productGid: string | undefined = incoming?.id;
      if (!productGid) continue;

      const sf = await storefront.request(STOREFRONT_PRODUCT_QUERY, { id: productGid });
      const product = sf?.product;
      if (!product) continue; // not on sales channel etc.

      const shopifyProductId = idFromGid(product.id);
      if (!shopifyProductId) continue;

      const productDocId = `shopifyProduct-${shopifyProductId}`;

      // Build variant docs first (and gather refs with uuidv5 keys)
      const variantNodes = product.variants?.nodes || [];
      const variantRefs: Array<{ _key: string; _type: "reference"; _ref: string; _weak: boolean }> = [];

      for (const v of variantNodes) {
        const variantId = idFromGid(v.id);
        if (!variantId) continue;

        const variantDocId = `shopifyProductVariant-${variantId}`;

        let enriched: Awaited<ReturnType<typeof fetchVariantData>> | null = null;
        try {
          enriched = await fetchVariantData(v.id);
        } catch (e) {
          console.error("Variant enrichment failed", v.id, e);
        }

        const price = v.price?.amount ? Number(v.price.amount) : undefined;
        const compareAtPrice = v.compareAtPrice?.amount ? Number(v.compareAtPrice.amount) : undefined;

        tx.createIfNotExists({
          _id: variantDocId,
          _type: "productVariant",
          store: {},
        });

        tx.patch(variantDocId, (p) =>
          p.set({
            "store.gid": v.id,
            "store.id": Number(variantId),
            "store.title": v.title,
            "store.sku": v.sku,
            "store.price": Number.isFinite(price) ? price : undefined,
            "store.compareAtPrice": Number.isFinite(compareAtPrice) ? compareAtPrice : undefined,
            "store.previewImageUrl": v.image?.url,
            "store.option1": v.selectedOptions?.[0]?.value,
            "store.option2": v.selectedOptions?.[1]?.value,
            "store.option3": v.selectedOptions?.[2]?.value,
            "store.colorHex": enriched?.colorHex ?? null,
            "store.inventory": enriched?.inventory ?? undefined,
          })
        );

        const refKey = uuidv5(variantDocId, UUID_NAMESPACE_PRODUCT_VARIANT!);

        variantRefs.push({
          _key: refKey,
          _type: "reference",
          _ref: variantDocId,
          _weak: true,
        });

        patched += 1;
      }

      const prices = variantNodes
        .map((vn: { price?: { amount?: string } | null }) => (vn?.price?.amount ? Number(vn.price.amount) : null))
        .filter((n: number | null): n is number => n !== null && Number.isFinite(n));

      const priceRange =
        prices.length > 0
          ? { minVariantPrice: Math.min(...prices), maxVariantPrice: Math.max(...prices) }
          : undefined;

      const firstImageUrl =
        product.images?.nodes?.[0]?.url || product.featuredImage?.url || undefined;

      const options =
        (product.options || []).map((opt: { id: string; name: string; values?: string[] }) => ({
          _type: "option",
          _key: opt.id,
          name: opt.name,
          values: opt.values ?? [],
        })) || [];

      tx.createIfNotExists({
        _id: productDocId,
        _type: "product",
        store: {},
      });

      tx.patch(productDocId, (p) =>
        p.set({
          "store.gid": product.id,
          "store.id": Number(shopifyProductId),
          "store.title": product.title,
          "store.slug": { current: product.handle },
          "store.descriptionHtml": product.descriptionHtml,
          "store.vendor": product.vendor,
          "store.productType": product.productType,
          "store.previewImageUrl": firstImageUrl,
          "store.options": options,
          "store.priceRange": priceRange,
          "store.variants": variantRefs,
          "store.requiresSellingPlan": product.requiresSellingPlan,
          "store.sellingPlanGroups": product.sellingPlanGroups,
        })
      );

      patched += 1;
    }

    if (patched > 0) await tx.commit();
    return NextResponse.json({ message: "OK", patched }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
