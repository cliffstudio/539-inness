import Link from 'next/link'
import { redirect } from 'next/navigation'
import { client } from '../../../../../sanity.client'
import ButtonLink from '../../../../components/ButtonLink'
import BodyClassProvider from '../../../../components/BodyClassProvider'
import { siteSearchQuery } from '../../../../sanity/lib/queries'

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

const getExcerpt = (text?: string, length = 220) => {
  if (!text) return ''
  if (text.length <= length) return text
  const truncated = text.slice(0, length)
  const lastSpace = truncated.lastIndexOf(' ')
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : truncated.length)}...`
}

const formatResultHeading = (count: number, term: string) => {
  const pluralised = count === 1 ? 'result' : 'results'
  return `Showing ${count} ${pluralised} found for "${term}"`
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

const getDetailSlug = (result: SearchResult) => {
  if (result.resultType === 'activity') {
    return result.slug ? `activities/${result.slug}` : 'activities'
  }

  if (!result.slug) {
    return ''
  }

  return result.slug.startsWith('/') ? result.slug.slice(1) : result.slug
}

export default async function SearchResultsPage({ searchParams }: { searchParams?: SearchParams | Promise<SearchParams> }) {
  let resolvedSearchParams: SearchParams | undefined
  if (typeof (searchParams as Promise<SearchParams>)?.then === 'function') {
    resolvedSearchParams = await (searchParams as Promise<SearchParams>)
  } else {
    resolvedSearchParams = searchParams as SearchParams | undefined
  }

  const searchTerm = getSearchTerm(resolvedSearchParams)
  if (!searchTerm) {
    redirect('/search')
  }
  const searchData = await fetchSearchResults(searchTerm)
  const combinedResults = sortResults([...searchData.activities, ...searchData.pages])
  const totalResults = combinedResults.length

  return (
    <section className="search-results-page h-pad">
      <BodyClassProvider pageType="search-results" slug="search-results" />

      <div className="inner-wrap">
        <div className="search-results-page__intro">
          <p className="search-results-page__eyebrow body-bigger">Search Results</p>

          <h4>
            {searchTerm
              ? formatResultHeading(totalResults, searchTerm)
              : 'Enter a search term to see matching results'}
          </h4>
        </div>

        {totalResults > 0 ? (
          <div className="search-results-page__list">
            {combinedResults.map((result) => {
              const detailSlug = getDetailSlug(result)
              const href = getResultHref(result)

              return (
                <article key={result._id} className="search-results-page__item">
                  <h5 className="search-results-page__item-title">
                    <Link href={href}>
                      {result.title ?? 'Untitled result'}
                    </Link>
                  </h5>

                  {result.descriptionPlain && (
                    <p>{getExcerpt(result.descriptionPlain)}</p>
                  )}
                  
                  <div className="search-results-page__cta">
                    {detailSlug && (
                      <ButtonLink
                        link={{
                          linkType: 'internal',
                          label: 'Read more',
                          pageLink: {
                            slug: detailSlug,
                            title: result.title,
                          },
                        }}
                      />
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <>
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

            <p>
              We couldn&apos;t find any results matching &quot;{searchTerm}&quot;. Try another search or{' '}
              <Link href="/">explore the site</Link>.
            </p>
          </>
        )}
      </div>
    </section>
  )
}


