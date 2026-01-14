import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL?.replace('https://', '').replace('http://', '').replace('.myshopify.com', '') || 'inness-hotel'

const CART_ID_COOKIE = 'shopify-cart-id'

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set')
}

/**
 * Shopify Storefront API GraphQL client
 */
async function shopifyStorefront(query: string, variables?: Record<string, unknown>) {
  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error('Shopify Storefront API token not configured')
  }

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}.myshopify.com/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Shopify Storefront API failed: ${response.status} ${text}`)
  }

  const json = await response.json()
  if (json.errors?.length) {
    throw new Error(`Shopify Storefront API errors: ${JSON.stringify(json.errors)}`)
  }

  return json.data
}

/**
 * Create a new cart
 */
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Add lines to an existing cart
 */
const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Update cart lines
 */
const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Remove lines from cart
 */
const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Get cart by ID
 */
const CART_QUERY = `
  query getCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      lines(first: 250) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
    }
  }
`

/**
 * POST /api/shopify/cart - Create cart or add/update lines
 */
export async function POST(request: NextRequest) {
  try {
    if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify Storefront API token not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, items, cartId } = body

    const cookieStore = await cookies()
    const existingCartId = cartId || cookieStore.get(CART_ID_COOKIE)?.value

    // Convert variant IDs to GID format and prepare cart lines
    const lines = items.map((item: { variantId: number; quantity: number }) => ({
      merchandiseId: `gid://shopify/ProductVariant/${item.variantId}`,
      quantity: item.quantity,
    }))

    let cart
    let newCartId: string | undefined

    if (!existingCartId || action === 'create') {
      // Create new cart
      const data = await shopifyStorefront(CART_CREATE_MUTATION, {
        input: {
          lines,
        },
      })

      if (data.cartCreate.userErrors?.length > 0) {
        return NextResponse.json(
          { error: 'Cart creation failed', userErrors: data.cartCreate.userErrors },
          { status: 400 }
        )
      }

      cart = data.cartCreate.cart
      newCartId = cart.id
    } else {
      // Add lines to existing cart
      const data = await shopifyStorefront(CART_LINES_ADD_MUTATION, {
        cartId: existingCartId,
        lines,
      })

      if (data.cartLinesAdd.userErrors?.length > 0) {
        return NextResponse.json(
          { error: 'Failed to add lines to cart', userErrors: data.cartLinesAdd.userErrors },
          { status: 400 }
        )
      }

      cart = data.cartLinesAdd.cart
      newCartId = cart.id
    }

    // Set cookie with cart ID
    const response = NextResponse.json({
      cartId: newCartId,
      checkoutUrl: cart.checkoutUrl,
      lines: cart.lines.edges.map((edge: { node: { id: string; quantity: number; merchandise: { id: string } } }) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        variantId: edge.node.merchandise.id.replace('gid://shopify/ProductVariant/', ''),
      })),
    })

    if (newCartId) {
      response.cookies.set(CART_ID_COOKIE, newCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return response
  } catch (error) {
    console.error('Shopify cart API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/shopify/cart - Update cart lines
 */
export async function PUT(request: NextRequest) {
  try {
    if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify Storefront API token not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { cartId, updates } = body // updates: [{ lineId, quantity }] or [{ variantId, quantity }]

    const cookieStore = await cookies()
    const existingCartId = cartId || cookieStore.get(CART_ID_COOKIE)?.value

    if (!existingCartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    // If updates use variantId, we need to get the cart first to find line IDs
    // For now, assume updates use lineId (from previous cart state)
    const lines = updates.map((update: { lineId?: string; variantId?: number; quantity: number }) => {
      if (update.lineId) {
        return {
          id: update.lineId,
          quantity: update.quantity,
        }
      }
      // If variantId is provided, we'd need to fetch cart first to get line IDs
      // This is a simplified version - you may want to enhance this
      throw new Error('Line ID required for updates')
    })

    const data = await shopifyStorefront(CART_LINES_UPDATE_MUTATION, {
      cartId: existingCartId,
      lines,
    })

    if (data.cartLinesUpdate.userErrors?.length > 0) {
      return NextResponse.json(
        { error: 'Failed to update cart', userErrors: data.cartLinesUpdate.userErrors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      cartId: data.cartLinesUpdate.cart.id,
      checkoutUrl: data.cartLinesUpdate.cart.checkoutUrl,
      lines: data.cartLinesUpdate.cart.lines.edges.map((edge: { node: { id: string; quantity: number; merchandise: { id: string } } }) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        variantId: edge.node.merchandise.id.replace('gid://shopify/ProductVariant/', ''),
      })),
    })
  } catch (error) {
    console.error('Shopify cart update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/shopify/cart - Remove lines from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify Storefront API token not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lineIds = searchParams.get('lineIds')?.split(',') || []

    const cookieStore = await cookies()
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value

    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    if (lineIds.length === 0) {
      return NextResponse.json({ error: 'No line IDs provided' }, { status: 400 })
    }

    const data = await shopifyStorefront(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds,
    })

    if (data.cartLinesRemove.userErrors?.length > 0) {
      return NextResponse.json(
        { error: 'Failed to remove lines from cart', userErrors: data.cartLinesRemove.userErrors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      cartId: data.cartLinesRemove.cart.id,
      checkoutUrl: data.cartLinesRemove.cart.checkoutUrl,
      lines: data.cartLinesRemove.cart.lines.edges.map((edge: { node: { id: string; quantity: number; merchandise: { id: string } } }) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        variantId: edge.node.merchandise.id.replace('gid://shopify/ProductVariant/', ''),
      })),
    })
  } catch (error) {
    console.error('Shopify cart remove error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/shopify/cart - Get cart by ID
 */
export async function GET(request: NextRequest) {
  try {
    if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify Storefront API token not configured' },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value

    if (!cartId) {
      return NextResponse.json({ cart: null })
    }

    const data = await shopifyStorefront(CART_QUERY, {
      id: cartId,
    })

    if (!data.cart) {
      // Cart doesn't exist, clear cookie
      const response = NextResponse.json({ cart: null })
      response.cookies.delete(CART_ID_COOKIE)
      return response
    }

    return NextResponse.json({
      cart: {
        id: data.cart.id,
        checkoutUrl: data.cart.checkoutUrl,
        lines: data.cart.lines.edges.map((edge: { node: { id: string; quantity: number; merchandise: { id: string } } }) => ({
          id: edge.node.id,
          quantity: edge.node.quantity,
          variantId: edge.node.merchandise.id.replace('gid://shopify/ProductVariant/', ''),
        })),
      },
    })
  } catch (error) {
    console.error('Shopify cart get error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
