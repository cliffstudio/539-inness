# Next.js + Sanity CMS Starter

A modern, clean starter template for building content-driven websites with Next.js 15 and Sanity CMS.

## Features

- ⚡️ **Next.js 15** with App Router
- 🎨 **Sanity CMS** for content management
- 📝 **TypeScript** for type safety
- 🎯 **Tailwind CSS** for styling
- 🔧 **Flexible Schema** with modular sections
- 📦 **Sanity Studio** embedded at `/studio`

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Sanity account (free at [sanity.io](https://www.sanity.io))

### 2. Create a Sanity Project

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Create a new project
3. Note your **Project ID** and **Dataset** name (usually `production`)

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example environment file and add your Sanity credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Sanity project details:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

#### Peoplevine event sync

To enable automatic syncing of events from Peoplevine into Sanity:

- **Required (Peoplevine auth & API):**
  - `PEOPLEVINE_BASE_URL` – Base URL for the Peoplevine API (e.g. `https://api.peoplevine.com`)
  - `PEOPLEVINE_USERNAME` – Peoplevine API username
  - `PEOPLEVINE_PASSWORD` – Peoplevine API password
  - `PEOPLEVINE_COMPANY_ID` – Peoplevine company ID
  - `PEOPLEVINE_REGION` – Region header value to send on every request (defaults to `uk` if omitted)
  - `PEOPLEVINE_EVENTS_PATH` – Path to the Peoplevine events **list** endpoint (e.g. `/api/events`)

- **Required (Sanity server-side auth):**
  - `SANITY_API_TOKEN` – Token with write access for the configured Sanity project/dataset

- **Required (sync protection):**
  - `PEOPLEVINE_SYNC_SECRET` – Secret string used to protect the sync API route from public access

##### How authentication works

1. The sync authenticates with Peoplevine by POSTing to `/api/token` on `PEOPLEVINE_BASE_URL` with:
   - `grant_type: "password"`
   - `username`, `password`, `company_id`
   - `remember_me: true`
2. The returned `access_token` is used as a Bearer token on subsequent requests, and the `Region` header is sent on **every** Peoplevine request.
3. Access tokens expire after ~30 minutes; the sync always requests a **fresh token** at the start of each run (no refresh token storage).

##### Running the sync

- Via HTTP (e.g. cron, manual trigger):
  - Send a `POST` request to `/api/sync/peoplevine-events`
  - Include header `x-sync-secret: $PEOPLEVINE_SYNC_SECRET`
  - The endpoint responds with a concise JSON summary:
    - `fetched` – number of events fetched from Peoplevine
    - `upserted` – number of Sanity documents created/updated
    - `markedInactive` – number of events marked inactive because they are no longer returned by Peoplevine
    - `failedMappings` – number of events that failed to map or upsert

All Peoplevine calls happen **server-side only** and never in client components.

##### Configuring the Peoplevine events endpoint

- Set `PEOPLEVINE_EVENTS_PATH` to the Peoplevine events list endpoint path.
- The base URL comes from `PEOPLEVINE_BASE_URL`; the final URL is:
  - `${PEOPLEVINE_BASE_URL}${PEOPLEVINE_EVENTS_PATH}?page_number=...&page_size=...`
- **Known TODO:** Once the final Peoplevine events endpoint and response payload are confirmed, update:
  - The `PEOPLEVINE_EVENTS_PATH` value
  - The mapping logic in `src/server/peoplevine/client.ts` (see `mapPeoplevineEventToNormalized` and the inline TODOs)

##### Synced vs editorial fields

Peoplevine is treated as the source of truth for **core event fields**, while Sanity is the source of truth for **editorial fields**.

- **Synced (read-only in Studio, updated by sync):**
  - `peoplevineId`
  - `title`
  - `startsAt`
  - `endsAt`
  - `locationName`
  - `locationAddress`
  - `lastSyncedAt`
  - `isActive`

- **Editor-controlled (never overwritten by sync):**
  - `slug`
  - `summary`
  - `heroImage`
  - `content` (portable text)
  - `seo` (reference to `siteSettings`)

The sync:

- Uses deterministic IDs for event pages: `_id = "eventPage-pv-${peoplevineId}"`
- Upserts only the synced fields and `isActive`
- Marks missing events as `isActive = false` instead of deleting them

### 5. Run Development Server

```bash
npm run dev
```

Your app will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Sanity Studio**: [http://localhost:3000/studio](http://localhost:3000/studio)

### 6. Create Your First Page

1. Visit [http://localhost:3000/studio](http://localhost:3000/studio)
2. Create a new **Page**
3. Set the slug to `home`
4. Add some sections (Hero Section, Text Section, etc.)
5. Publish the page
6. Visit [http://localhost:3000](http://localhost:3000) to see your page

## Project Structure

```
nextjs-sanity-starter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Main layout group (pages, layout, routes)
│   │   ├── api/               # API routes (Shopify, Sanity Connect)
│   │   ├── studio/            # Sanity Studio route
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components (UI, sections, pages)
│   ├── contexts/              # React contexts (Basket, Booking)
│   ├── sanity/                 # Sanity configuration & schemas
│   │   ├── schemaTypes/       # Content schemas
│   │   │   ├── objects/       # Reusable objects
│   │   │   ├── sections/      # Page sections
│   │   │   └── utils/         # Schema helpers (e.g. imageValidation)
│   │   ├── components/       # Sanity Studio–only components (inputs, status)
│   │   ├── lib/               # Queries & data loaders (footerSettings)
│   │   └── utils/             # Sanity utilities (imageUrlBuilder, etc.)
│   ├── types/                 # TypeScript types
│   ├── utils/                 # App utilities (linkHelpers, lazyLoad, etc.)
│   └── styles/                # SCSS
├── sanity.config.ts           # Sanity Studio config
├── sanity.client.ts           # Sanity client
└── package.json
```

## Schema Structure

### Page Type

Pages are the main content type. Each page can have:
- **Title**: Page title
- **Slug**: URL path
- **Sections**: Array of content sections

### Section Types

#### Hero Section
- Heading
- Subheading
- Image
- Call-to-action button

#### Text Section
- Heading
- Rich text content

### Adding New Sections

1. Create a new section type in `src/sanity/schemaTypes/sections/`
2. Import and add it to `src/sanity/schemaTypes/index.ts`
3. Create a corresponding React component in `src/components/`
4. Add a render case for the section in `src/components/FlexibleContent.tsx`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typegen` - Generate TypeScript types from Sanity schemas

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

### Deploy Sanity Studio

The Sanity Studio is automatically deployed with your Next.js app at `/studio`.

Alternatively, you can deploy it separately:

```bash
npm run build
```

Then configure CORS origins in your [Sanity project settings](https://www.sanity.io/manage).

## Customization

### Styling

This template uses Tailwind CSS. Customize your theme in `tailwind.config.js` or add custom CSS to `src/app/globals.css`.

### Content Schema

Edit schema types in `src/sanity/schemaTypes/` to match your content needs.

### Components

All React components are in `src/app/components/`. Modify them to match your design requirements.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues and questions:
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Sanity Community](https://www.sanity.io/community)

## License

MIT

