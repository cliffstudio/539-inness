import { NextRequest, NextResponse } from 'next/server'
import { getAllEvents, PeoplevineError } from '@/server/peoplevine/client'
import { syncPeoplevineEvents } from '@/sanity/lib/peoplevineEventsSync'

const SYNC_SECRET = process.env.PEOPLEVINE_SYNC_SECRET
const CRON_SECRET = process.env.CRON_SECRET

async function handleSync(request: NextRequest) {
  if (!SYNC_SECRET && !CRON_SECRET) {
    return NextResponse.json(
      {
        error:
          'Sync secret is not configured. Set PEOPLEVINE_SYNC_SECRET or CRON_SECRET in your environment.',
      },
      { status: 500 }
    )
  }

  let providedSecret: string | null =
    request.headers.get('x-sync-secret') ??
    request.headers.get('X-Sync-Secret') ??
    request.headers.get('x-peoplevine-sync-secret')

  if (!providedSecret) {
    const authHeader =
      request.headers.get('authorization') ??
      request.headers.get('Authorization')

    if (authHeader?.startsWith('Bearer ')) {
      providedSecret = authHeader.slice('Bearer '.length)
    }
  }

  const validSecrets = [SYNC_SECRET, CRON_SECRET].filter(Boolean) as string[]

  if (!providedSecret || !validSecrets.includes(providedSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized: missing or invalid sync secret.' },
      { status: 401 }
    )
  }

  try {
    const events = await getAllEvents()
    const summary = await syncPeoplevineEvents(events)

    return NextResponse.json(
      {
        ok: true,
        ...summary,
      },
      { status: 200 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[peoplevine] Sync failed', error)

    if (error instanceof PeoplevineError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          status: error.status,
        },
        { status: error.status && error.status >= 400 ? error.status : 500 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error while syncing Peoplevine events.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return handleSync(request)
}

// Allow Vercel Cron Jobs (which use GET + Authorization header) to trigger the sync.
export async function GET(request: NextRequest) {
  return handleSync(request)
}

