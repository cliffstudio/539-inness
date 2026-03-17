import 'server-only'

import { PeoplevineError } from './client'

const PEOPLEVINE_BASE_URL =
  process.env.PEOPLEVINE_BASE_URL ?? 'https://api.peoplevine.com'
const PEOPLEVINE_USERNAME = process.env.PEOPLEVINE_USERNAME
const PEOPLEVINE_PASSWORD = process.env.PEOPLEVINE_PASSWORD
const PEOPLEVINE_REGION = process.env.PEOPLEVINE_REGION ?? 'uk'

export type PeoplevineTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

export type PeoplevineCompany = {
  company_id: number
  name?: string
  // Allow any other fields without assuming their shape.
  [key: string]: unknown
}

type FetchImpl = typeof fetch

export async function getUserToken(
  fetchImpl: FetchImpl = fetch
): Promise<PeoplevineTokenResponse> {
  if (!PEOPLEVINE_BASE_URL || !PEOPLEVINE_USERNAME || !PEOPLEVINE_PASSWORD) {
    throw new PeoplevineError(
      'Peoplevine credentials are not configured. Please set PEOPLEVINE_BASE_URL, PEOPLEVINE_USERNAME and PEOPLEVINE_PASSWORD.',
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
      username: PEOPLEVINE_USERNAME,
      password: PEOPLEVINE_PASSWORD,
      grant_type: 'password',
      remember_me: true,
    }),
  })

  const bodyText = await res.text()

  if (res.status === 401) {
    // eslint-disable-next-line no-console
    console.error('[peoplevine] Auth 401 response body:', bodyText)
    throw new PeoplevineError(
      'Peoplevine authentication failed (401 Unauthorized). Check username/password.',
      401
    )
  }

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `[peoplevine] Auth failed with status ${res.status}. Response body:`,
      bodyText
    )
    throw new PeoplevineError(
      `Peoplevine authentication failed (${res.status}).`,
      res.status
    )
  }

  let json: unknown
  try {
    json = bodyText ? JSON.parse(bodyText) : {}
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[peoplevine] Failed to parse auth JSON:', error, bodyText)
    throw new PeoplevineError(
      'Peoplevine authentication response was not valid JSON.',
      res.status
    )
  }

  const tokenResponse = json as Partial<PeoplevineTokenResponse>

  if (!tokenResponse.access_token) {
    // eslint-disable-next-line no-console
    console.error(
      '[peoplevine] Auth response missing access_token. Full response:',
      json
    )
    throw new PeoplevineError(
      'Peoplevine authentication response did not include access_token.',
      res.status
    )
  }

  return {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_in: tokenResponse.expires_in,
  }
}

export async function getCompanies(
  accessToken: string,
  fetchImpl: FetchImpl = fetch
): Promise<PeoplevineCompany[]> {
  if (!PEOPLEVINE_BASE_URL) {
    throw new PeoplevineError(
      'Peoplevine base URL is not configured. Please set PEOPLEVINE_BASE_URL.',
      500
    )
  }

  const url = new URL('/api/company', PEOPLEVINE_BASE_URL)

  const res = await fetchImpl(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Region: PEOPLEVINE_REGION,
    },
  })

  const bodyText = await res.text()

  if (res.status === 401) {
    // eslint-disable-next-line no-console
    console.error('[peoplevine] Companies 401 response body:', bodyText)
    throw new PeoplevineError(
      'Peoplevine companies request unauthorized (401). Token may be invalid.',
      401
    )
  }

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `[peoplevine] Companies request failed with status ${res.status}. Response body:`,
      bodyText
    )
    throw new PeoplevineError(
      `Peoplevine companies request failed (${res.status}).`,
      res.status
    )
  }

  let json: unknown
  try {
    json = bodyText ? JSON.parse(bodyText) : {}
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[peoplevine] Failed to parse companies JSON:',
      error,
      bodyText
    )
    throw new PeoplevineError(
      'Peoplevine companies response was not valid JSON.',
      res.status
    )
  }

  // Do not assume the top-level shape; handle common patterns safely.
  const asArray = Array.isArray(json)
    ? json
    : Array.isArray((json as any)?.items)
    ? (json as any).items
    : []

  const companies: PeoplevineCompany[] = asArray
    .filter((item: any) => item && typeof item === 'object')
    .map((item: any) => ({
      ...item,
      company_id: Number(
        (item as any).company_id ??
          (item as any).companyId ??
          (item as any).CompanyId ??
          (item as any).CompanyID
      ),
    }))
    .filter((company) => Number.isFinite(company.company_id))

  if (!companies.length) {
    // eslint-disable-next-line no-console
    console.error(
      '[peoplevine] No companies found in response. Full payload:',
      json
    )
    throw new PeoplevineError(
      'Peoplevine companies response did not contain any companies with a valid company_id.',
      res.status
    )
  }

  return companies
}

export async function getCompanyId(
  fetchImpl: FetchImpl = fetch
): Promise<{ companyId: number | null; companies: PeoplevineCompany[] }> {
  const { access_token } = await getUserToken(fetchImpl)
  const companies = await getCompanies(access_token, fetchImpl)

  if (companies.length === 1) {
    const companyId = companies[0]?.company_id
    // eslint-disable-next-line no-console
    console.log('[peoplevine] Found single company_id:', companyId)
    return { companyId, companies }
  }

  // More than one company – log them all so you can inspect.
  // eslint-disable-next-line no-console
  console.log('[peoplevine] Multiple companies returned from /api/company:')
  // eslint-disable-next-line no-console
  console.log(
    companies.map((c) => ({
      company_id: c.company_id,
      name: c.name,
    }))
  )

  return { companyId: null, companies }
}

