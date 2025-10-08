import { HeroSection } from './HeroSection'
import { TextSection } from './TextSection'

interface PageRendererProps {
  page: any
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
      {page.sections.map((section: any, index: number) => {
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

