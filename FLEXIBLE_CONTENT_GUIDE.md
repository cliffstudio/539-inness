# Flexible Content System

This project now includes a flexible content system similar to Advanced Custom Fields' flexible content field. This allows you to dynamically add and arrange different types of content blocks on any page.

## Available Content Blocks

### Hero Section (`heroSection`)
- **Fields**: Layout, Heading, Body (rich text), Image, Specs, Button
- **Use case**: Large banner sections with customizable layouts

## How to Use

### In Sanity Studio
1. Edit any page in Sanity Studio
2. Scroll to the "Content Blocks" section
3. Click "Add item" to add a new content block
4. Choose "Hero Section" from the dropdown
5. Fill in the fields for the hero section
6. Reorder blocks by dragging them up or down

### In Your Frontend Components
The `FlexibleContent` component automatically renders all content blocks based on their type:

```tsx
import FlexibleContent from './components/FlexibleContent'

// In your page component
<FlexibleContent contentBlocks={page.contentBlocks || []} />
```

## Adding New Content Block Types

To add a new content block type:

1. **Create the schema** in `src/sanity/schemaTypes/sections/yourBlock.ts`
2. **Add to flexible content** in `src/sanity/schemaTypes/objects/flexibleContent.ts`
3. **Register in schema index** in `src/sanity/schemaTypes/index.ts`
4. **Add query fragment** in `src/sanity/lib/queries.ts`
5. **Add render case** in `src/components/FlexibleContent.tsx`

## Example: Adding a Text Block

1. Create `src/sanity/schemaTypes/sections/textBlock.ts`:
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

2. Add to `flexibleContent.ts`:
```typescript
{
  type: 'textBlock',
  title: 'Text Block'
}
```

3. Add render case in `FlexibleContent.tsx`:
```typescript
case 'textBlock':
  return (
    <div key={index} className="text-block">
      {block.heading && <h2>{block.heading}</h2>}
      {block.content && <PortableText value={block.content} />}
    </div>
  )
```

## Benefits

- **Flexible**: Add any combination of content blocks to any page
- **Reusable**: Content blocks can be used across different page types
- **Maintainable**: Easy to add new block types without touching existing code
- **User-friendly**: Non-technical users can build complex page layouts
- **Type-safe**: Full TypeScript support for all content block types
