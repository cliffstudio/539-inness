import { ALL_FIELDS_GROUP } from "sanity"

export const DEFAULT_CURRENCY_CODE = 'USD'

export const GROUPS = [
  {
    ...ALL_FIELDS_GROUP,
    hidden: true,
  },
  {
    name: 'editorial',
    title: 'Editorial',
  },
  {
    name: 'shopifySync',
    title: 'Shopify',
  },
  {
    name: 'seo',
    title: 'SEO',
  },
]
