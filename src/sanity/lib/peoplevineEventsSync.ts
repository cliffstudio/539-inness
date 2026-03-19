import { createClient } from '@sanity/client'
import { dataset, projectId, apiVersion } from '@/sanity/env'
import {
  NormalizedPeoplevineEvent,
  buildEventPageDocumentId,
} from '@/server/peoplevine/client'

const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

type SyncResult = {
  fetched: number
  upserted: number
  deleted: number
  failedMappings: number
  errors?: string[]
}

function slugFromTitleOrId(title: string, id: string): string {
  const fromTitle = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // Always include the Peoplevine ID to guarantee global uniqueness
  // and avoid slug collisions between events with the same title.
  return fromTitle ? `${fromTitle}-${id}` : `event-${id}`
}

export async function upsertEventPage(e: NormalizedPeoplevineEvent): Promise<void> {
  const _id = buildEventPageDocumentId(e.id)
  const nowIso = new Date().toISOString()
  const slugCurrent = slugFromTitleOrId(e.title, e.id)

  // patch() only updates existing docs; create the doc first if it doesn't exist
  const tx = sanity.transaction()
  tx.createIfNotExists({
    _id,
    _type: 'calendar',
    peoplevineId: e.id,
    isActive: true,
  })
  tx.patch(_id, (patch) =>
    patch.set({
      title: e.title,
      startsAt: e.startsAt,
      endsAt: e.endsAt ?? null,
      locationName: e.locationName ?? null,
      locationAddress: e.locationAddress ?? null,
      description: e.description ?? '',
      thumbnail: e.thumbnail ?? '',
      bookingHref: e.externalLink ?? null,
      eventCategories: e.eventCategories ?? [],
      lastSyncedAt: nowIso,
      isActive: true,
    }).setIfMissing({
      slug: { _type: 'slug', current: slugCurrent },
    })
  )
  await tx.commit({ autoGenerateArrayKeys: true })
}

export async function deleteMissingEvents(currentIds: string[]): Promise<number> {
  if (!currentIds.length) {
    return 0
  }

  // Fetch all existing calendar docs that are linked to Peoplevine.
  const existing =
    (await sanity.fetch<
      { _id: string; peoplevineId?: string | null; isActive?: boolean }[]
    >(`*[_type == "calendar" && defined(peoplevineId)]{_id, peoplevineId, isActive}`)) || []

  const currentIdSet = new Set(currentIds)
  const toDelete = existing.filter(
    (doc) =>
      doc.peoplevineId &&
      !currentIdSet.has(doc.peoplevineId) &&
      doc.isActive !== false
  )

  if (!toDelete.length) {
    return 0
  }

  const tx = sanity.transaction()

  for (const doc of toDelete) {
    tx.delete(doc._id)
  }

  await tx.commit()
  return toDelete.length
}

export async function deletePastEvents(): Promise<number> {
  const pastEvents =
    (await sanity.fetch<{ _id: string }[]>(
      `*[_type == "calendar" && defined(peoplevineId) && defined(endsAt) && endsAt < now()]{_id}`
    )) || []

  if (!pastEvents.length) {
    return 0
  }

  const tx = sanity.transaction()

  for (const doc of pastEvents) {
    tx.delete(doc._id)
  }

  await tx.commit()
  return pastEvents.length
}

export async function syncPeoplevineEvents(
  events: NormalizedPeoplevineEvent[]
): Promise<SyncResult> {
  const result: SyncResult = {
    fetched: events.length,
    upserted: 0,
    deleted: 0,
    failedMappings: 0,
    errors: [],
  }

  const activeIds: string[] = []

  for (const event of events) {
    try {
      await upsertEventPage(event)
      activeIds.push(event.id)
      result.upserted += 1
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        '[peoplevine] Failed to upsert event into Sanity',
        event.id,
        err
      )
      result.failedMappings += 1
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Unknown error while upserting event'
      if (result.errors && result.errors.length < 10) {
        result.errors.push(`id=${event.id}: ${message}`)
      }
    }
  }

  // Fully delete events that no longer appear in Peoplevine.
  const deletedMissing = await deleteMissingEvents(activeIds)
  // Also remove events that have already happened.
  const deletedPast = await deletePastEvents()
  result.deleted = deletedMissing + deletedPast

  return result
}

