import Link from 'next/link'
import BodyClassProvider from '../../components/BodyClassProvider'

export default function NotFound() {
  return (
    <>
      <BodyClassProvider pageType="404" slug="404" />
      
      <div className="not-found-page h-pad">
        <div className="inner-wrap">
          <div>
            <div className="not-found-page__heading">404</div>

            <h5 className="not-found-page__subheading">Page not found</h5>

            <p className="not-found-page__body">The page you are trying to access cannot be found. It may have been removed, had its name changed, or is temporarily unavailable.</p>
          </div>
          
          <Link href="/" className="not-found-page__button">
            Back to homepage
          </Link>
        </div>
      </div>
    </>
  )
}

