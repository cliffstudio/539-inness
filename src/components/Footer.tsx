'use client'

import type { Footer } from '../types/footerSettings'
import { getLinkInfo } from '../utils/linkHelpers'

interface FooterProps {
  footer: Footer
}

export default function Footer({ footer }: FooterProps) {
  if (!footer) return null

  return (
    <footer className="site-footer h-pad">
      <div className="row-lg top">
        <div className="col-4-12_lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="245" height="75" viewBox="0 0 245 75">
            <path d="M9.03846 6.49919V67.5109C9.03846 69.2057 9.90615 70.0162 10.7015 70.6057C11.6415 71.3426 12.5092 71.9321 12.5092 71.9321V72.4479H0V71.9321C0 71.9321 0.867692 71.4163 1.80769 70.6057C2.67538 69.9425 3.47077 69.2057 3.47077 67.5109V6.49919C3.47077 4.80442 2.60308 3.99388 1.80769 3.4044C0.867692 2.66754 0 2.07806 0 2.07806V1.56226H12.5092V2.07806C12.5092 2.07806 11.6415 2.59386 10.7015 3.4044C9.83384 4.06757 9.03846 4.80442 9.03846 6.49919Z"/>
            <path d="M110.857 1.03931V1.55413C110.857 1.55413 111.727 2.1425 112.668 3.0986C113.393 3.83406 114.335 4.49597 114.335 7.29072V60.5381L73.8397 5.01079C72.4633 2.9515 72.0287 1.99541 71.8113 1.03931H60.438V1.55413C62.249 2.28959 64.9294 3.61342 66.5955 5.8198C67.4648 6.92299 69.8554 10.0119 69.8554 13.248L69.9279 60.5381L29.433 5.01079C28.0566 2.9515 27.6219 1.99541 27.4046 1.03931H16.0312V1.55413C17.8423 2.28959 20.5226 3.61342 22.1888 5.8198C23.0581 6.92299 25.4487 10.0119 25.4487 13.248V65.5392C25.4487 68.3339 24.5069 68.9959 23.7825 69.7313C22.8408 70.6874 21.9715 71.2758 21.9715 71.2758V71.7906H31.3889V71.2758C31.3889 71.2758 30.5196 70.6874 29.5778 69.7313C28.8534 68.9959 27.9117 68.3339 27.9117 65.5392V13.4686C41.1685 31.2667 71.6665 72.9673 71.6665 72.9673H72.3909L72.3184 13.4686C85.5753 31.2667 116.073 72.9673 116.073 72.9673H116.798V7.29072C116.798 4.49597 117.739 3.83406 118.464 3.0986C119.406 2.1425 120.275 1.55413 120.275 1.55413V1.03931H110.857Z"/>
            <path d="M161.328 72.4479H123.801V71.9321C123.801 71.9321 124.659 71.4163 125.588 70.6057C126.446 69.9425 127.232 69.2057 127.232 67.5109V6.49919C127.232 4.80442 126.374 3.99388 125.588 3.4044C124.659 2.66754 123.801 2.07806 123.801 2.07806V1.56226H159.184V8.48871H158.541C157.826 7.38342 157.04 6.64657 156.468 5.9834C154.967 4.436 153.966 3.84651 151.678 3.84651H132.664V32.8787H152.036C154.752 32.8787 155.396 31.9207 156.11 31.1839C157.04 30.226 157.683 29.3417 157.683 29.3417H158.112V38.7735H157.683C157.683 38.7735 157.04 37.8893 156.11 36.9314C155.396 36.1945 154.752 35.2366 152.036 35.2366H132.664V70.2373H153.823C155.896 70.2373 157.04 69.0583 158.326 67.732C158.97 67.0688 159.899 65.8898 160.614 64.9319H161.328V72.4479Z"/>
            <path d="M165.792 63.4922C170.564 69.0836 176.204 72.1001 182.35 72.1001C193.341 72.1001 198.113 64.5222 198.113 56.7972C198.113 45.6143 189.87 41.9357 181.772 37.8157C173.312 33.475 164.852 29.0607 164.852 17.8779C164.852 7.50429 172.805 0 183.579 0C189.798 0 195.365 1.61857 199.342 3.09V9.56429H198.692C193.63 4.41429 189.653 1.98643 183.435 1.98643C173.601 1.98643 169.552 8.31358 169.552 14.7879C169.552 23.8372 176.132 28.2514 184.085 32.0036C192.69 36.1236 202.958 40.3172 202.958 53.3393C202.958 66.3615 193.63 74.0129 182.278 74.0129C175.625 74.0129 168.901 71.9529 165.141 70.3343V63.4922H165.792Z"/>
            <path d="M207.42 63.4922C212.193 69.0836 217.833 72.1001 223.979 72.1001C234.97 72.1001 239.742 64.5222 239.742 56.7972C239.742 45.6143 231.499 41.9357 223.4 37.8157C214.94 33.475 206.48 29.0607 206.48 17.8779C206.48 7.50429 214.434 0 225.208 0C231.427 0 236.994 1.61857 240.971 3.09V9.56429H240.32C235.259 4.41429 231.282 1.98643 225.064 1.98643C215.23 1.98643 211.18 8.31358 211.18 14.7879C211.18 23.8372 217.76 28.2514 225.714 32.0036C234.319 36.1236 244.587 40.3172 244.587 53.3393C244.587 66.3615 235.259 74.0129 223.907 74.0129C217.254 74.0129 210.53 71.9529 206.77 70.3343V63.4922H207.42Z"/>
          </svg>
        </div>

        {/* Navigation Column 1 */}
        {footer.navigationColumn1 && (
          <div className="col-2-12_lg">
            {footer.navigationColumn1.heading && (
              <h5 className="site-footer__heading">{footer.navigationColumn1.heading}</h5>
            )}

            {footer.navigationColumn1.links && footer.navigationColumn1.links.length > 0 && (
              <div className="site-footer__links">
                {footer.navigationColumn1.links.map((link, linkIndex) => {
                  const { href, text } = getLinkInfo(link)
                  if (!href || !text) return null
                  return (
                    <div key={linkIndex}>
                      <a
                        href={href}
                        className="site-footer__link"
                        {...(link.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                        {...(link.linkType === 'file' && { target: '_blank', rel: 'noopener noreferrer', download: link.file?.asset?.originalFilename })}
                      >
                        {text}
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Navigation Column 2 */}
        {footer.navigationColumn2 && (
          <div className="col-2-12_lg">
            {footer.navigationColumn2.heading && (
              <h5 className="site-footer__heading">{footer.navigationColumn2.heading}</h5>
            )}

            {footer.navigationColumn2.links && footer.navigationColumn2.links.length > 0 && (
              <div className="site-footer__links">
                {footer.navigationColumn2.links.map((link, linkIndex) => {
                  const { href, text } = getLinkInfo(link)
                  if (!href || !text) return null
                  return (
                    <div key={linkIndex}>
                      <a
                        href={href}
                        className="site-footer__link"
                        {...(link.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                        {...(link.linkType === 'file' && { target: '_blank', rel: 'noopener noreferrer', download: link.file?.asset?.originalFilename })}
                      >
                        {text}
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Follow Column */}
        {footer.followColumn && (
          <div className="col-2-12_lg">
            {footer.followColumn.heading && (
              <h5 className="site-footer__heading">{footer.followColumn.heading}</h5>
            )}

            {footer.followColumn.links && footer.followColumn.links.length > 0 && (
              <div className="site-footer__links">
                {footer.followColumn.links.map((link, linkIndex) => {
                  const { href, text } = getLinkInfo(link)
                  if (!href || !text) return null
                  return (
                    <div key={linkIndex}>
                      <a
                        href={href}
                        className="site-footer__link"
                        {...(link.linkType === 'external' && { target: '_blank', rel: 'noopener noreferrer' })}
                        {...(link.linkType === 'file' && { target: '_blank', rel: 'noopener noreferrer', download: link.file?.asset?.originalFilename })}
                      >
                        {text}
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Contact Column */}
        {footer.contactColumn && (
          <div className="col-2-12_lg">
            {footer.contactColumn.heading && (
              <h5 className="site-footer__heading">{footer.contactColumn.heading}</h5>
            )}

            {footer.contactColumn.contactItems && footer.contactColumn.contactItems.length > 0 && (
              <div className="site-footer__contact">
                {footer.contactColumn.contactItems.map((item, index) => {
                  if (!item.label || !item.phoneNumber) return null
                  const phoneHref = `tel:${item.phoneNumber.replace(/\D/g, '')}`
                  return (
                    <div key={index} className="site-footer__contact-item">
                      <span className="site-footer__contact-label">{item.label}: </span>
                      <a href={phoneHref} className="site-footer__contact-phone">
                        {item.phoneNumber}
                      </a>
                      <span className="site-footer__contact-extension">{item.extension && ` ${item.extension}`}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="row-lg">
        <div className="col-6-12_lg">
          {/* add email subscription form here */}
        </div>

        <div className="col-3-12_lg">
          <p className="site-footer__copyright">
            &copy; Copyright {new Date().getFullYear()} Inness, LLC
          </p>
        </div>

        <div className="col-3-12_lg">
          <a href="https://cliff.studio" target="_blank" rel="noopener noreferrer" className="site-footer__credit">
            <span className="credit-toggle">Credit</span>

            <p className="credit-content">
              Site by Cliff.Studio
            </p>
          </a>
        </div>
      </div>
    </footer>
  )
}
