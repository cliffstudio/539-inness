"use client"

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import mediaLazyloading from '../utils/lazyLoad'

interface MenuExtra {
  name?: string
  price?: number
}

interface MenuItem {
  name?: string
  price?: number
  extras?: MenuExtra[]
}

interface FoodCategory {
  name?: string
  items?: MenuItem[]
}

interface FoodTab {
  tabName?: string
  availability?: string
  image?: SanityImageSource
  categories?: FoodCategory[]
}

interface TimePrice {
  duration?: string
  price?: number
}

interface SpaTreatment {
  name?: string
  description?: string
  options?: TimePrice[]
}

interface VenueDetail {
  label?: string
  value?: string
}

interface VenueInfo {
  name?: string
  description?: string
  details?: VenueDetail[]
  includedServices?: string[]
}

interface MenuSectionProps {
  id?: string
  layout?: 'food-menu' | 'spa-menu' | 'venue-menu'
  heading?: string
  image?: SanityImageSource
  foodTabs?: FoodTab[]
  spaTreatments?: SpaTreatment[]
  venueInfo?: VenueInfo
}

export default function MenuSection({
  id,
  layout = 'food-menu',
  image,
  foodTabs,
  spaTreatments,
  venueInfo,
}: MenuSectionProps) {
  const [activeTab, setActiveTab] = useState(0)

  // Trigger lazy loading update when tab changes
  useEffect(() => {
    mediaLazyloading().catch(console.error)
  }, [activeTab])

  return (
    <section id={id} className={`menu-section layout-${layout} h-pad`}>
      
      {/* Food Menu Layout */}
      {layout === 'food-menu' && foodTabs && foodTabs.length > 0 && (
        <>
          {/* Tabs Navigation */}
          <div className="menu-tabs">
            {foodTabs.map((tab, tabIndex) => (
              <button
                key={tabIndex}
                className={`menu-tab ${activeTab === tabIndex ? 'active' : ''}`}
                onClick={() => setActiveTab(tabIndex)}
              >
                {tab.tabName}
              </button>
            ))}
          </div>
        
          <div className="row-lg">
            <div className="col-6-12_lg menu-content body-smaller">
              {/* Active Tab Content */}
              {foodTabs[activeTab] && (
                <div className="menu-tab-content">
                  <div className="menu-tab-header">
                    {foodTabs[activeTab].availability && (
                      <div className="menu-availability">{foodTabs[activeTab].availability}</div>
                    )}

                    <div>Price</div>
                  </div>

                  {foodTabs[activeTab].categories && foodTabs[activeTab].categories!.length > 0 && (
                    <div className="menu-categories">
                      {foodTabs[activeTab].categories!.map((category, catIndex) => (
                        <div key={catIndex} className="menu-category">
                          {category.name && (
                            <h5 className="menu-category-name">{category.name}</h5>
                          )}

                          {category.items && category.items.length > 0 && (
                            <div className="menu-items">
                              {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="menu-item">
                                  <div className="menu-item-header">
                                    {item.name && <div className="menu-item-name">{item.name}</div>}
                                    {item.price !== undefined && (
                                      <div className="menu-item-price">{item.price}</div>
                                    )}
                                  </div>

                                  {item.extras && item.extras.length > 0 && (
                                    <div className="menu-item-extras">
                                      <span className="menu-extras-label">Extras </span>
                                      {item.extras.map((extra, extraIndex) => (
                                        <span key={extraIndex} className="menu-extra">
                                          {extra.name}
                                          {extra.price !== undefined && ` +${extra.price}`}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {foodTabs[activeTab]?.image && (
              <div className="col-6-12_lg menu-image">
                <div className="media-wrap">
                  <img 
                    key={`tab-image-${activeTab}`}
                    data-src={urlFor(foodTabs[activeTab].image!).url()} 
                    alt="" 
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Spa Menu Layout */}
      {layout === 'spa-menu' && (
        <>
          <div className="col-3-12_lg menu-content">
            {spaTreatments && spaTreatments.length > 0 && (
              <div className="spa-treatments">
                {spaTreatments.map((treatment, index) => (
                  <div key={index} className="spa-treatment">
                    {treatment.name && (
                      <h5 className="spa-treatment-name">{treatment.name}</h5>
                    )}

                    {treatment.description && (
                      <div className="spa-treatment-description">
                        {treatment.description}
                      </div>
                    )}

                    {treatment.options && treatment.options.length > 0 && (
                      <div className="spa-treatment-options">
                        <table className="spa-options-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {treatment.options.map((option, optIndex) => (
                              <tr key={optIndex}>
                                <td>{option.duration}</td>
                                <td>{option.price !== undefined ? `$${option.price}` : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-3-12_lg dummy-col"></div>

          {image && (
            <div className="col-6-12_lg menu-image">
              <div className="media-wrap">
                <img 
                  data-src={urlFor(image).url()} 
                  alt="" 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Venue Menu Layout */}
      {layout === 'venue-menu' && venueInfo && (
        <>
          <div className="col-3-12_lg menu-content">
            {venueInfo.name && <h4 className="menu-heading">{venueInfo.name}</h4>}

            {venueInfo.description && (
              <div className="menu-description">{venueInfo.description}</div>
            )}

            {venueInfo.details && venueInfo.details.length > 0 && (
              <div className="venue-details">
                {venueInfo.details.map((detail, index) => (
                  <div key={index} className="venue-detail">
                    {detail.label && <div className="venue-detail-label">{detail.label}</div>}
                    {detail.value && <div className="venue-detail-value">{detail.value}</div>}
                  </div>
                ))}
              </div>
            )}

            {venueInfo.includedServices && venueInfo.includedServices.length > 0 && (
              <div className="venue-included">
                <h6 className="venue-included-heading">Closure includes:</h6>
                <ul className="venue-services-list">
                  {venueInfo.includedServices.map((service, index) => (
                    <li key={index} className="venue-service">{service}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="col-3-12_lg dummy-col"></div>

          {image && (
            <div className="col-6-12_lg menu-image">
              <div className="media-wrap">
                <img 
                  data-src={urlFor(image).url()} 
                  alt="" 
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

