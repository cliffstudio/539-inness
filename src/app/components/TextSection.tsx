import { PortableText } from '@portabletext/react'

interface TextSectionProps {
  heading?: string
  content?: any
}

export function TextSection({ heading, content }: TextSectionProps) {
  return (
    <section style={{ 
      padding: '4rem 2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {heading && (
        <h2 style={{ 
          fontSize: '2rem',
          marginBottom: '2rem',
          fontWeight: 'bold'
        }}>
          {heading}
        </h2>
      )}
      {content && (
        <div style={{
          fontSize: '1.125rem',
          lineHeight: '1.75'
        }}>
          <PortableText value={content} />
        </div>
      )}
    </section>
  )
}

