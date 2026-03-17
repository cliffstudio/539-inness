import type { NextRequest } from 'next/server'

export type PeoplevineAuthResponse = {
  access_token: string
  expires_in?: number
  token_type?: string
}

export type PeoplevinePagination = {
  pageNumber: number
  pageSize: number
  totalPages?: number
  totalRecords?: number
}

export type NormalizedPeoplevineEvent = {
  id: string
  title: string
  description: string
  thumbnail: string
  startsAt: string
  endsAt: string
  locationName: string
  locationAddress?: string
  externalLink?: string
  eventCategories?: string[]
  raw?: unknown
}

type FetchImpl = typeof fetch

const PEOPLEVINE_BASE_URL =
  process.env.PEOPLEVINE_BASE_URL ?? 'https://api.peoplevine.com'
const PEOPLEVINE_USERNAME = process.env.PEOPLEVINE_USERNAME
const PEOPLEVINE_PASSWORD = process.env.PEOPLEVINE_PASSWORD
const PEOPLEVINE_COMPANY_ID = process.env.PEOPLEVINE_COMPANY_ID
const PEOPLEVINE_REGION = process.env.PEOPLEVINE_REGION ?? 'uk'
const PEOPLEVINE_EVENT_BASE_URL =
  process.env.PEOPLEVINE_EVENT_BASE_URL ?? 'https://members.inness.co'

// Configurable events endpoint path – update this once the final endpoint is known.
// You can also override via PEOPLEVINE_EVENTS_PATH env var.
const PEOPLEVINE_EVENTS_PATH =
  process.env.PEOPLEVINE_EVENTS_PATH ?? '/api/events' // TODO: Confirm final Peoplevine events list endpoint path.

if (!PEOPLEVINE_BASE_URL || !PEOPLEVINE_USERNAME || !PEOPLEVINE_PASSWORD || !PEOPLEVINE_COMPANY_ID) {
  // Intentionally do not throw here so that tests / build can still run without credentials.
  // The sync entrypoint will validate and fail fast with a clear error instead.
  // eslint-disable-next-line no-console
  console.warn(
    '[peoplevine] Missing one or more required environment variables: PEOPLEVINE_BASE_URL, PEOPLEVINE_USERNAME, PEOPLEVINE_PASSWORD, PEOPLEVINE_COMPANY_ID'
  )
}

export class PeoplevineError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'PeoplevineError'
    this.status = status
  }
}

export function parsePaginationHeader(headerValue: string | null): PeoplevinePagination | undefined {
  if (!headerValue) return undefined
  try {
    // Peoplevine docs mention "pagination" header – assume JSON payload.
    const parsed = JSON.parse(headerValue)
    return {
      pageNumber:
        typeof parsed.pageNumber === 'number'
          ? parsed.pageNumber
          : typeof parsed.page_number === 'number'
          ? parsed.page_number
          : 1,
      pageSize:
        typeof parsed.pageSize === 'number'
          ? parsed.pageSize
          : typeof parsed.page_size === 'number'
          ? parsed.page_size
          : 50,
      totalPages:
        typeof parsed.totalPages === 'number'
          ? parsed.totalPages
          : typeof parsed.total_pages === 'number'
          ? parsed.total_pages
          : undefined,
      totalRecords:
        typeof parsed.totalRecords === 'number'
          ? parsed.totalRecords
          : typeof parsed.total_records === 'number'
          ? parsed.total_records
          : undefined,
    }
  } catch {
    // If the header is not JSON, swallow and return undefined so the sync can still proceed.
    return undefined
  }
}

export function buildEventPageDocumentId(peoplevineId: string): string {
  return `calendar-pv-${peoplevineId}`
}

function htmlToPlainText(html: string): string {
  // Strip tags
  const withoutTags = html.replace(/<[^>]+>/g, ' ')
  // Decode a few common entities and collapse whitespace
  return withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;|&#8217;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function mapPeoplevineEventToNormalized(event: any): NormalizedPeoplevineEvent | null {
  if (!event) return null

  const isEventPublished = (ev: any): boolean => {
    const rawStatus =
      (ev && (ev.status ?? ev.Status ?? ev.event_status ?? ev.EventStatus)) ?? null
  
    if (typeof rawStatus === 'string') {
      const normalized = rawStatus.toLowerCase()
      return normalized === 'approved'
    }
  
    // If no status is present at all, allow the event through
    return true
  }

  if (!isEventPublished(event)) {
    return null
  }

  // ID
  const id: string | undefined =
    event.id

  // Title
  const title: string =
    event.title

  // Description (HTML → plain text)
  const rawDescription: string | undefined =
    event.description ?? event.details ?? event.body
  const description: string = rawDescription ? htmlToPlainText(String(rawDescription)) : ''

  // Location
  const locationName: string | undefined =
    event.venue
  const locationAddress: string | undefined =
    event.venue_address ??
    event.address ??
    event.location ??
    event.location_address

  // Thumbnail
  let thumbnail: string | undefined =
    event.thumbnail ?? event.image ?? event.hero_image ?? event.graphic

  // If Peoplevine returns a relative path, prefix with the base URL
  if (thumbnail && thumbnail.startsWith('/')) {
    thumbnail = `${PEOPLEVINE_BASE_URL.replace(/\/$/, '')}${thumbnail}`
  }

  // Categories
  const extractCategoryNames = (): string[] => {
    const names: string[] = []
    const categories = event.categories

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat && typeof cat === 'object') {
          if (cat.name) {
            names.push(String(cat.name))
          }
          if (cat.parent_category?.name) {
            names.push(String(cat.parent_category.name))
          }
          if (Array.isArray(cat.child_categories)) {
            for (const child of cat.child_categories) {
              if (child?.name) {
                names.push(String(child.name))
              }
            }
          }
        }
      }
    }

    return Array.from(new Set(names))
  }

  const eventCategories = extractCategoryNames()

  // Dates
  const startsAt: string | undefined =
    event.start_date ?? event.startDate ?? event.starts_at

  const endsAt: string | undefined =
    event.end_date ?? event.endDate ?? event.ends_at

  const ticketUrl: string | undefined =
    Array.isArray(event.tickets) && event.tickets.length > 0
      ? event.tickets[0]?.url ?? event.tickets[0]?.external_link
      : undefined

  // Prefer explicit URLs from the API, but fall back to the canonical
  // Peoplevine event page URL pattern: https://members.inness.co/event/{id}
  const explicitUrl: string | undefined =
    event.external_link ?? event.url ?? ticketUrl

  const externalLink: string | undefined =
    explicitUrl ||
    (id
      ? `${PEOPLEVINE_EVENT_BASE_URL.replace(/\/$/, '')}/event/${id}`
      : undefined)

  return {
    id: String(id),
    title: String(title),
    description: String(description),
    locationName: locationName ? String(locationName) : '',
    locationAddress: locationAddress ? String(locationAddress) : undefined,
    thumbnail: thumbnail ? String(thumbnail) : '',
    startsAt: startsAt ? String(startsAt) : new Date().toISOString(),
    endsAt: endsAt ? String(endsAt) : new Date().toISOString(),
    externalLink: externalLink ? String(externalLink) : undefined,
    eventCategories: eventCategories.length ? eventCategories : undefined,
  }
}

export async function getAccessToken(fetchImpl: FetchImpl = fetch): Promise<string> {
  if (!PEOPLEVINE_BASE_URL || !PEOPLEVINE_USERNAME || !PEOPLEVINE_PASSWORD || !PEOPLEVINE_COMPANY_ID) {
    throw new PeoplevineError(
      'Peoplevine credentials are not configured. Please set PEOPLEVINE_BASE_URL, PEOPLEVINE_USERNAME, PEOPLEVINE_PASSWORD and PEOPLEVINE_COMPANY_ID.',
      500
    )
  }

  const url = new URL('/api/token', PEOPLEVINE_BASE_URL)

  const res = await fetchImpl(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Region: PEOPLEVINE_REGION,
    },
    body: JSON.stringify({
      grant_type: 'password',
      username: PEOPLEVINE_USERNAME,
      password: PEOPLEVINE_PASSWORD,
      company_id: PEOPLEVINE_COMPANY_ID,
      remember_me: true,
    }),
  })

  if (res.status === 401) {
    throw new PeoplevineError('Peoplevine authentication failed (401 Unauthorized). Check username/password.', 401)
  }
  if (res.status === 403) {
    throw new PeoplevineError('Peoplevine authentication forbidden (403). Check company ID and permissions.', 403)
  }
  if (res.status === 429) {
    throw new PeoplevineError('Peoplevine rate limit exceeded (429) while authenticating.', 429)
  }
  if (res.status >= 500) {
    throw new PeoplevineError(`Peoplevine authentication failed with server error (${res.status}).`, res.status)
  }
  if (!res.ok) {
    throw new PeoplevineError(`Peoplevine authentication failed (${res.status}).`, res.status)
  }

  const json = (await res.json()) as PeoplevineAuthResponse
  if (!json.access_token) {
    throw new PeoplevineError('Peoplevine authentication response did not include access_token.', res.status)
  }

  return json.access_token
}

export async function getEventsPage(
  accessToken: string,
  pageNumber: number,
  pageSize: number,
  fetchImpl: FetchImpl = fetch
): Promise<{ events: any[]; pagination?: PeoplevinePagination }> {
  const url = new URL(PEOPLEVINE_EVENTS_PATH, PEOPLEVINE_BASE_URL)
  url.searchParams.set('page_number', String(pageNumber))
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('status', 'approved')

  const res = await fetchImpl(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Region: PEOPLEVINE_REGION,
    },
  })

  if (res.status === 401) {
    throw new PeoplevineError('Peoplevine events request unauthorized (401). Token may have expired.', 401)
  }
  if (res.status === 403) {
    throw new PeoplevineError('Peoplevine events request forbidden (403). Check API permissions.', 403)
  }
  if (res.status === 429) {
    throw new PeoplevineError('Peoplevine rate limit exceeded (429) while fetching events.', 429)
  }
  if (res.status >= 500) {
    throw new PeoplevineError(`Peoplevine events request failed with server error (${res.status}).`, res.status)
  }
  if (!res.ok) {
    const body = await res.text()
    throw new PeoplevineError(
      `Peoplevine events request failed (${res.status}): ${body}`,
      res.status
    )
  }

  const paginationHeader = res.headers.get('pagination')
  const pagination = parsePaginationHeader(paginationHeader)
  const json = await res.json()

  // TODO: Confirm the exact shape of the list response.
  // For now assume either an array or an { items: [] } container.
  const events: any[] = Array.isArray(json) ? json : Array.isArray(json.items) ? json.items : []

  return { events, pagination }
}

export async function getAllEvents(fetchImpl: FetchImpl = fetch): Promise<NormalizedPeoplevineEvent[]> {
  const accessToken = await getAccessToken(fetchImpl)

  // Peoplevine requires Page_Size between 1 and 50 (see 422 error)
  const pageSize = 50
  let pageNumber = 1
  const normalized: NormalizedPeoplevineEvent[] = []

  // Simple pagination loop – uses pagination header when present, otherwise stops on empty page.
  // This keeps the implementation safe even if Peoplevine changes pagination slightly.
  // Maximum safety: cap at a generous number of pages to avoid accidental infinite loops.
  const MAX_PAGES = 1000

  for (let i = 0; i < MAX_PAGES; i++) {
    const { events, pagination } = await getEventsPage(accessToken, pageNumber, pageSize, fetchImpl)

    for (const ev of events) {
      const mapped = mapPeoplevineEventToNormalized(ev)
      if (mapped) {
        normalized.push(mapped)
      }
    }

    const totalPages = pagination?.totalPages
    if (totalPages && pageNumber >= totalPages) {
      break
    }
    if (!events.length && !totalPages) {
      break
    }

    pageNumber += 1
  }

  return normalized
}

