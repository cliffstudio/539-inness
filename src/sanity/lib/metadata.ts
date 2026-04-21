import type { Metadata } from 'next'
import type { SanityImageSource } from '@sanity/image-url'

type SeoInput = {
  metaTitle?: string | null
  metaDescription?: string | null
  socialImage?: SanityImageSource | null
} | null

type SiteSettingsInput = {
  title?: string | null
  description?: string | null
  socialimage?: SanityImageSource | null
} | null

type BuildPageMetadataParams = {
  pageTitle?: string | null
  seo?: SeoInput
  siteSettings?: SiteSettingsInput
  buildImageUrl: (image: SanityImageSource) => string
}

export function buildPageMetadata({
  pageTitle,
  seo,
  siteSettings,
  buildImageUrl,
}: BuildPageMetadataParams): Metadata {
  const baseSiteTitle = siteSettings?.title?.trim()
  const seoTitle = seo?.metaTitle?.trim()
  const resolvedTitle = seoTitle || [pageTitle, baseSiteTitle].filter(Boolean).join(' | ') || baseSiteTitle

  const resolvedDescription = seo?.metaDescription?.trim() || siteSettings?.description

  const socialImageSource = seo?.socialImage ?? siteSettings?.socialimage
  const socialImageUrl = socialImageSource ? buildImageUrl(socialImageSource) : undefined

  return {
    title: resolvedTitle || undefined,
    description: resolvedDescription || undefined,
    authors: [{ name: 'Inness' }],
    openGraph: {
      title: resolvedTitle || undefined,
      description: resolvedDescription || undefined,
      type: 'website',
      locale: 'en_US',
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle || undefined,
      description: resolvedDescription || undefined,
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
  }
}
