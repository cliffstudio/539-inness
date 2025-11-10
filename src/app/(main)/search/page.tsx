import Link from 'next/link'
import { client } from '../../../../sanity.client'
import { siteSearchQuery } from '../../../sanity/lib/queries'
import BodyClassProvider from '../../../components/BodyClassProvider'

export const revalidate = 0

type SearchParams = {
  q?: string | string[]
}

type BaseResult = {
  _id: string
  title?: string
  slug?: string
  descriptionPlain?: string
  resultType: 'activity' | 'page'
}

type ActivityResult = BaseResult & {
  resultType: 'activity'
  activityType?: string
  date?: string
  timeRange?: {
    startTime?: string
    endTime?: string
  }
}

type PageResult = BaseResult & {
  resultType: 'page'
  pageType?: string
}

type SearchResult = ActivityResult | PageResult

type SearchData = {
  activities: ActivityResult[]
  pages: PageResult[]
}

const getSearchTerm = (searchParams?: SearchParams) => {
  const rawValue = searchParams?.q
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
  return value?.trim() ?? ''
}

const fetchSearchResults = async (term: string): Promise<SearchData> => {
  if (!term) {
    return { activities: [], pages: [] }
  }

  const normalizedTerm = term.replace(/\s+/g, ' ')
  const wildcardTerm = `*${normalizedTerm}*`

  return client.fetch<SearchData>(siteSearchQuery, {
    wildcardTerm,
  })
}

const sortResults = (results: SearchResult[]) =>
  results.slice().sort((a, b) =>
    (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
  )

const formatResultCount = (count: number) => {
  return `${count} result${count === 1 ? '' : 's'}`
}

const getResultHref = (result: SearchResult) => {
  if (result.resultType === 'activity') {
    return result.slug ? `/activities/${result.slug}` : '/activities'
  }

  if (!result.slug) {
    return '/'
  }

  const normalizedSlug = result.slug.startsWith('/') ? result.slug.slice(1) : result.slug
  return `/${normalizedSlug}`
}

type SearchParamsInput = SearchParams | Promise<SearchParams> | undefined

const resolveSearchParams = async (searchParams: SearchParamsInput) => {
  if (!searchParams) return undefined
  if (typeof (searchParams as Promise<SearchParams>)?.then === 'function') {
    return await (searchParams as Promise<SearchParams>)
  }
  return searchParams
}

type SearchPageProps = {
  searchParams?: Promise<SearchParams>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await resolveSearchParams(searchParams)
  const searchTerm = getSearchTerm(resolvedSearchParams)
  const searchData = await fetchSearchResults(searchTerm)
  const combinedResults = sortResults([...searchData.activities, ...searchData.pages])
  const topResults = combinedResults.slice(0, 4)
  const totalResults = combinedResults.length
  const hasResults = totalResults > 0

  return (
    <>
      <BodyClassProvider pageType="search" slug="search" />

      <div className="search-page h-pad">
        <div className="inner-wrap">
          <form className="search-form" action="/search" method="get">
            <div className="search-form__field">
              <input
                id="site-search"
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="Search"
                autoComplete="off"
              />
              <button type="submit" aria-label="Submit search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                  <path d="M7.9259 14.4243C11.8656 14.4243 15.0593 11.3653 15.0593 7.59173C15.0593 3.81821 11.8656 0.759171 7.9259 0.759171C3.98622 0.759171 0.79248 3.81821 0.79248 7.59173C0.79248 11.3653 3.98622 14.4243 7.9259 14.4243Z" />
                  <path d="M12.6816 12.9059L17.4373 17.461" />
                </svg>
              </button>
            </div>
          </form>

          {searchTerm && (
            <div className="search-page__results">
              {hasResults ? (
                <>
                  <ul className="search-page__results-list">
                    {topResults.map((result) => (
                      <li key={result._id}>
                        <Link href={getResultHref(result)}>
                          {result.title ?? 'Untitled result'}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {totalResults > topResults.length && (
                    <div className="search-page__show-all">
                      <Link href={`/search/results?q=${encodeURIComponent(searchTerm)}`}>
                        {`${formatResultCount(totalResults)} found, show all`}
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="search-page__empty">
                  <p>
                    We couldn&apos;t find any results matching &quot;{searchTerm}&quot;. Try another search or{' '}
                    <Link href="/">explore the site</Link>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}