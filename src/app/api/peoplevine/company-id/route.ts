import { NextResponse } from 'next/server'
import { getCompanyId } from '@/server/peoplevine/companyId'
import { PeoplevineError } from '@/server/peoplevine/client'

export async function GET() {
  try {
    const { companyId, companies } = await getCompanyId()

    return NextResponse.json(
      {
        ok: true,
        companyId,
        companies,
      },
      { status: 200 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[peoplevine] Failed to resolve company_id', error)

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
            : 'Unknown error while resolving Peoplevine company_id.',
      },
      { status: 500 }
    )
  }
}

