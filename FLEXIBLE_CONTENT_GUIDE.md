# Flexible Content System

## How to Use

### In Sanity Studio
1. Edit any page in Sanity Studio
2. Scroll to the "Content Blocks" section
3. Click "Add item" to add a new content block
4. Choose from available content blocks (Hero Section, Media & Text Section, etc.)
5. Fill in the fields for your chosen section
6. Reorder blocks by dragging them up or down

### In Your Frontend Components
The `FlexibleContent` component automatically renders all content blocks based on their type:

```tsx
import FlexibleContent from './components/FlexibleContent'

// In your page component
<FlexibleContent contentBlocks={page.contentBlocks || []} />
```

## Adding New Content Block Types

To add a new content block type, follow these steps:

1. **Create the schema** in `src/sanity/schemaTypes/sections/yourBlock.ts`
2. **Add to flexible content** in `src/sanity/schemaTypes/objects/flexibleContent.ts`
3. **Register in schema index** in `src/sanity/schemaTypes/index.ts`
4. **Add query fragment** in `src/sanity/lib/queries.ts`
5. **Create the React component** in `src/components/YourBlock.tsx`
6. **Add render case** in `src/components/FlexibleContent.tsx`

## Example: Adding a Text Block

1. **Create the schema** `src/sanity/schemaTypes/sections/textBlock.ts`:
```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
```

2. **Add to flexible content** in `src/sanity/schemaTypes/objects/flexibleContent.ts`:
```typescript
{
  type: 'textBlock',
  title: 'Text Block'
}
```

3. **Register in schema index** in `src/sanity/schemaTypes/index.ts`:
```typescript
import textBlock from './sections/textBlock'

export const schemaTypes = [
  // ... existing types
  textBlock
]
```

4. **Add query fragment** in `src/sanity/lib/queries.ts`:
```typescript
const textBlockFragment = groq`{
  heading,
  content
}`

// Update the flexibleContentFragment to include your new block:
const flexibleContentFragment = groq`{
  _type,
  ...select(_type == "heroSection" => ${heroSectionFragment})
  ...select(_type == "mediaTextSection" => ${mediaTextSectionFragment})
  ...select(_type == "textBlock" => ${textBlockFragment})
}`
```

5. **Create the React component** `src/components/TextBlock.tsx`:
```typescript
import { PortableText, PortableTextBlock } from '@portabletext/react'

interface TextBlockProps {
  heading?: string
  content?: PortableTextBlock[]
}

export default function TextBlock({ heading, content }: TextBlockProps) {
  return (
    <section className="text-block">
      {heading && <h2>{heading}</h2>}
      {content && <PortableText value={content} />}
    </section>
  )
}
```

6. **Add render case** in `src/components/FlexibleContent.tsx`:
```typescript
import TextBlock from './TextBlock'

// In the switch statement:
case 'textBlock':
  return <TextBlock key={index} {...block} />
```

## Current Available Content Blocks

- **Hero Section** (`heroSection`) - Full-width hero with image, heading, body, and optional button
- **Media & Text Section** (`mediaTextSection`) - Flexible layout with image and text content
