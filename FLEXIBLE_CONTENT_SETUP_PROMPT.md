# Flexible Content Blocks Setup Prompt

Use this prompt in your other Sanity project to set up the flexible content blocks system.

---

## Prompt for AI Assistant

I want to set up a flexible content blocks system in my Sanity project, similar to how WordPress ACF flexible content fields work. This will allow content editors to add, remove, and reorder different types of content blocks on pages.

### System Overview

The flexible content system consists of:
1. **Sanity Schema**: An array field that accepts multiple content block types
2. **Query Fragments**: GROQ fragments for each block type to fetch all necessary data
3. **React Component**: A component that renders the appropriate React component based on block type
4. **Individual Block Components**: React components for each content block type

**General Page Template**: This system is perfect for "General Page" templates where pages are built entirely from flexible content blocks. General Pages don't require special hero sections or page-specific fields - they're composed entirely of the content blocks that editors add and arrange.

### Required File Structure

Create the following structure in your Sanity project:

```
src/
├── sanity/
│   ├── schemaTypes/
│   │   ├── objects/
│   │   │   └── flexibleContent.ts
│   │   └── sections/
│   │       ├── heroSection.ts
│   │       └── textSection.ts
│   └── lib/
│       └── queries.ts
└── components/
    ├── FlexibleContent.tsx
    ├── HeroSection.tsx
    └── TextSection.tsx
```

### Step 1: Create the Flexible Content Schema Object

Create `src/sanity/schemaTypes/objects/flexibleContent.ts`:

```typescript
import { defineType } from 'sanity'

export default defineType({
  name: 'flexibleContent',
  title: 'Content Blocks',
  type: 'array',
  of: [
    {
      type: 'heroSection',
      title: 'Hero Section'
    },
    {
      type: 'textSection',
      title: 'Text Section'
    },
    // Add more block types here as you create them
  ],
  options: {
    sortable: true,
  }
})
```

### Step 2: Create Example Section Schemas

Create `src/sanity/schemaTypes/sections/heroSection.ts`:

```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full Bleed Image & Content', value: 'full-bleed' },
          { title: 'Split Image & Content', value: 'split' },
        ],
      },
      initialValue: 'full-bleed',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link', // Assuming you have a link object type
    }),
  ],
  preview: {
    select: {
      media: 'image',
      heading: 'heading',
    },
    prepare({ media, heading }) {
      return {
        title: 'Hero Section',
        media: media,
        subtitle: heading || 'No Heading',
      }
    }
  }
})
```

Create `src/sanity/schemaTypes/sections/textSection.ts`:

```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'textSection',
  title: 'Text Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link',
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare({ heading }) {
      return {
        title: 'Text Section',
        subtitle: heading || 'No Heading',
      }
    }
  }
})
```

### Step 3: Register Schemas

In your `src/sanity/schemaTypes/index.ts`, add:

```typescript
// Objects
import flexibleContent from './objects/flexibleContent'

// Sections
import heroSection from './sections/heroSection'
import textSection from './sections/textSection'

export const schemaTypes = [
  // ... your existing types
  
  // Objects
  flexibleContent,
  
  // Sections
  heroSection,
  textSection,
]
```

### Step 4: Add Flexible Content Field to Page Schema

In your page schema (e.g., `src/sanity/schemaTypes/pageType.ts`), add:

```typescript
defineField({
  name: 'contentBlocks',
  title: 'Content Blocks',
  type: 'flexibleContent',
  description: 'Add and arrange content blocks to build your page',
}),
```

**Note about Page Types**: If you have different page types (like "General Page", "Homepage", etc.), the flexible content blocks field should be available for "General Page" and any other page types that use flexible content. You can conditionally show/hide the field based on page type:

```typescript
defineField({
  name: 'contentBlocks',
  title: 'Content Blocks',
  type: 'flexibleContent',
  description: 'Add and arrange content blocks to build your page',
  hidden: ({ parent }) => parent?.pageType === 'text' || parent?.pageType === 'links',
  // Only hide for specific page types that don't use flexible content
}),
```

### Step 5: Create Query Fragments

In `src/sanity/lib/queries.ts`, add fragments for each block type:

```typescript
import { groq } from 'next-sanity'

// Reusable fragments
const imageFragment = groq`{
  asset {
    _ref,
    _type
  },
  hotspot,
  crop
}`

const linkFragment = groq`{
  linkType,
  label,
  href,
  // Add other link fields as needed
}`

// Block-specific fragments
const heroSectionFragment = groq`{
  id,
  layout,
  heading,
  body,
  image ${imageFragment},
  button ${linkFragment}
}`

const textSectionFragment = groq`{
  id,
  heading,
  body,
  button ${linkFragment}
}`

// Main flexible content fragment
const flexibleContentFragment = groq`{
  _type,
  ...select(_type == "heroSection" => ${heroSectionFragment}),
  ...select(_type == "textSection" => ${textSectionFragment})
}`

// Update your page query to include contentBlocks
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    contentBlocks[] ${flexibleContentFragment}
  }
`
```

### Step 6: Create the FlexibleContent React Component

Create `src/components/FlexibleContent.tsx`:

```typescript
import React from 'react'
import HeroSection from './HeroSection'
import TextSection from './TextSection'

interface ContentBlock {
  _type: string
  [key: string]: unknown
}

interface FlexibleContentProps {
  contentBlocks: ContentBlock[]
}

const FlexibleContent: React.FC<FlexibleContentProps> = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return null
  }

  return (
    <div className="flexible-content">
      {contentBlocks.map((block, index) => {
        switch (block._type) {
          case 'heroSection':
            return <HeroSection key={index} {...(block as ContentBlock)} />
          case 'textSection':
            return <TextSection key={index} {...(block as ContentBlock)} />
          default:
            console.warn(`Unknown content block type: ${block._type}`)
            return null
        }
      })}
    </div>
  )
}

export default FlexibleContent
```

### Step 7: Create Individual Block Components

Create `src/components/HeroSection.tsx`:

```typescript
import React from 'react'
import { PortableText } from '@portabletext/react'
import Image from 'next/image' // or your image component

interface HeroSectionProps {
  id?: string
  layout?: 'full-bleed' | 'split'
  heading?: string
  body?: any[]
  image?: any
  button?: any
}

export default function HeroSection({ 
  id, 
  layout, 
  heading, 
  body, 
  image, 
  button 
}: HeroSectionProps) {
  return (
    <section id={id} className={`hero-section hero-section--${layout}`}>
      {heading && <h1>{heading}</h1>}
      {body && <PortableText value={body} />}
      {image && (
        <div className="hero-section__image">
          {/* Render your image here */}
        </div>
      )}
      {button && (
        <a href={button.href}>{button.label}</a>
      )}
    </section>
  )
}
```

Create `src/components/TextSection.tsx`:

```typescript
import React from 'react'
import { PortableText } from '@portabletext/react'

interface TextSectionProps {
  id?: string
  heading?: string
  body?: any[]
  button?: any
}

export default function TextSection({ 
  id, 
  heading, 
  body, 
  button 
}: TextSectionProps) {
  return (
    <section id={id} className="text-section">
      {heading && <h2>{heading}</h2>}
      {body && <PortableText value={body} />}
      {button && (
        <a href={button.href}>{button.label}</a>
      )}
    </section>
  )
}
```

### Step 8: Use FlexibleContent in Your Pages

In your page component, you can use FlexibleContent for General Pages (and any other page types that use flexible content):

```typescript
import FlexibleContent from '@/components/FlexibleContent'
import { client } from '@/sanity.client'
import { pageQuery } from '@/sanity/lib/queries'

export default async function Page({ params }) {
  const page = await client.fetch(pageQuery, { slug: params.slug })
  
  // For General Pages, simply render the flexible content blocks
  if (page.pageType === 'general' || !page.pageType) {
    return (
      <div>
        <h1>{page.title}</h1>
        <FlexibleContent contentBlocks={page.contentBlocks || []} />
      </div>
    )
  }
  
  // Handle other page types as needed
  // ...
}
```

**General Page Template**: General Pages are the default template that uses flexible content blocks. They don't have any special hero sections or page-specific fields - they're built entirely from the flexible content blocks that editors add. This makes them perfect for creating custom page layouts.

### Adding New Content Block Types

To add a new content block type:

1. **Create the schema** in `src/sanity/schemaTypes/sections/yourBlock.ts`
2. **Add to flexibleContent** in `src/sanity/schemaTypes/objects/flexibleContent.ts` (add to the `of` array)
3. **Register in schema index** in `src/sanity/schemaTypes/index.ts`
4. **Add query fragment** in `src/sanity/lib/queries.ts` (create fragment and add to `flexibleContentFragment`)
5. **Create the React component** in `src/components/YourBlock.tsx`
6. **Add render case** in `src/components/FlexibleContent.tsx` (add a new case in the switch statement)

### Key Points

- Each block type must have a unique `_type` field (this is automatically set by Sanity)
- The `_type` field is used to determine which component to render
- Query fragments use GROQ's `select` function to conditionally include fields based on `_type`
- Blocks are sortable in Sanity Studio (enabled by `sortable: true` option)
- Always include `_type` in your query fragments to identify the block type

### Example: Adding a Media & Text Block

1. Create `src/sanity/schemaTypes/sections/mediaTextSection.ts` with fields for media, text, and layout options
2. Add `{ type: 'mediaTextSection', title: 'Media & Text Section' }` to `flexibleContent.ts`
3. Import and add to schema index
4. Create `mediaTextSectionFragment` in queries.ts and add to `flexibleContentFragment`
5. Create `MediaTextSection.tsx` component
6. Add case in `FlexibleContent.tsx` switch statement

Please implement this flexible content blocks system in my project following these steps exactly.

