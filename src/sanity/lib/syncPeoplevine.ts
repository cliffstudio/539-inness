import { createClient } from '@sanity/client'
import { dataset, projectId, apiVersion } from '@/sanity/env'

const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

export type PeoplevineEvent = {
  id: string
  title: string
  startsAt: string
  endsAt?: string
  locationName?: string
  locationAddress?: string
}

function docIdForPeoplevineEvent(id: string) {
  return `calendar-pv-${id}`
}

function slugFromTitleOrId(title: string, id: string): string {
  const fromTitle = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return fromTitle || `event-${id}`
}

export async function upsertEventIntoSanity(e: PeoplevineEvent) {
  const _id = docIdForPeoplevineEvent(e.id)
  const nowIso = new Date().toISOString()
  const slugCurrent = slugFromTitleOrId(e.title, e.id)

  return sanity
    .patch(_id)
    .setIfMissing({
      _id,
      _type: 'calendar',
      peoplevineId: e.id,
      slug: { _type: 'slug', current: slugCurrent },
    })
    .set({
      title: e.title,
      startsAt: e.startsAt,
      endsAt: e.endsAt ?? null,
      locationName: e.locationName ?? null,
      locationAddress: e.locationAddress ?? null,
      lastSyncedAt: nowIso,
      slug: { _type: 'slug', current: slugCurrent },
    })
    .commit({ autoGenerateArrayKeys: true })
}
