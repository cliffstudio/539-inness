import { HeroSection } from './HeroSection'
import { TextSection } from './TextSection'

interface Section {
  _type: 'heroSection' | 'textSection'
  _key?: string
  [key: string]: unknown
}

interface Page {
  title?: string
  sections?: Section[]
}

interface PageRendererProps {
  page: Page
}

export function PageRenderer({ page }: PageRendererProps) {
  if (!page || !page.sections) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>{page?.title || 'Page'}</h1>
        <p>No content sections found.</p>
      </div>
    )
  }

  return (
    <div>
      {page.sections.map((section: Section, index: number) => {
        switch (section._type) {
          case 'heroSection':
            return <HeroSection key={index} {...section} />
          case 'textSection':
            return <TextSection key={index} {...section} />
          default:
            return null
        }
      })}
    </div>
  )
}

