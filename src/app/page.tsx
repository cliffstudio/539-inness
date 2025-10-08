import Link from 'next/link'
import { client } from '../../sanity.client'
import { homepageQuery } from '../sanity/lib/queries'
import { PageRenderer } from './components/PageRenderer'

export default async function Home() {
  const homepage = await client.fetch(homepageQuery)
  
  if (!homepage) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Welcome to Next.js + Sanity Starter</h1>
        <p>No homepage found. Please create a page with slug &quot;home&quot; in Sanity Studio.</p>
        <p>Visit <Link href="/studio" style={{ color: 'blue', textDecoration: 'underline' }}>/studio</Link> to get started.</p>
      </div>
    )
  }

  return <PageRenderer page={homepage} />
}

