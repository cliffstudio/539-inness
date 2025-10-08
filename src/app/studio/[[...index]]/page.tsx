/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path should be handled by this file.
 */

import { NextStudio } from 'next-sanity/studio'

import config from '../../../../sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}

