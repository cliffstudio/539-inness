"use client"

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { PortableText, PortableTextBlock } from '@portabletext/react'
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
  description?: PortableTextBlock[]
  options?: TimePrice[]
}

interface SpaTab {
  tabName?: string
  image?: SanityImageSource
  treatments?: SpaTreatment[]
}

interface VenueSpec {
  specName?: string
  specDescription?: PortableTextBlock[]
}

interface VenueTab {
  areaName?: string
  areaDescription?: PortableTextBlock[]
  image?: SanityImageSource
  specs?: VenueSpec[]
}

interface MenuSectionProps {
  id?: string
  layout?: 'food-menu' | 'spa-menu' | 'venue-menu'
  heading?: string
  foodTabs?: FoodTab[]
  spaTabs?: SpaTab[]
  venueTabs?: VenueTab[]
}

export default function MenuSection({
  id,
  layout = 'food-menu',
  foodTabs,
  spaTabs,
  venueTabs,
}: MenuSectionProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [activeSpaTab, setActiveSpaTab] = useState(0)
  const [activeVenueTab, setActiveVenueTab] = useState(0)

  // Trigger lazy loading update when tab changes
  useEffect(() => {
    mediaLazyloading().catch(console.error)
  }, [activeTab, activeSpaTab, activeVenueTab])

  return (
    <section id={id} className={`menu-section layout-${layout} h-pad body-smaller`}>
      
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
            <div className="col-6-12_lg menu-content">
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
      {layout === 'spa-menu' && spaTabs && spaTabs.length > 0 && (
        <>
          {/* Tabs Navigation */}
          <div className="menu-tabs">
            {spaTabs.map((tab, tabIndex) => (
              <button
                key={tabIndex}
                className={`menu-tab ${activeSpaTab === tabIndex ? 'active' : ''}`}
                onClick={() => setActiveSpaTab(tabIndex)}
              >
                {tab.tabName}
              </button>
            ))}
          </div>
        
          <div className="row-lg">
            <div className="col-6-12_lg menu-content">
              {/* Active Tab Content */}
              <div className="menu-tab-header">
                <div className="time-column">Time</div>
                <div className="price-column">Price</div>
              </div>

              {spaTabs[activeSpaTab] && spaTabs[activeSpaTab].treatments && (
                <div className="spa-treatments">
                  {spaTabs[activeSpaTab].treatments.map((treatment, index) => (
                    <div key={index} className="spa-treatment">
                      {treatment.name && (
                        <h5 className="spa-treatment-name">{treatment.name}</h5>
                      )}

                      <div className="spa-treatment-content">
                        {treatment.description && treatment.description.length > 0 && (
                          <div className="spa-treatment-description">
                            <PortableText value={treatment.description} />
                          </div>
                        )}

                        {treatment.options && treatment.options.length > 0 && (
                          <div className="spa-treatment-options">
                            {treatment.options.map((option, optIndex) => (
                              <div className="spa-treatment-option" key={optIndex}>
                                <div>{option.duration}</div>
                                <div>{option.price !== undefined ? `${option.price}` : '-'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {spaTabs[activeSpaTab]?.image && (
              <div className="col-6-12_lg menu-image">
                <div className="media-wrap">
                  <img 
                    key={`spa-tab-image-${activeSpaTab}`}
                    data-src={urlFor(spaTabs[activeSpaTab].image!).url()} 
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

      {/* Venue Menu Layout */}
      {layout === 'venue-menu' && venueTabs && venueTabs.length > 0 && (
        <>
          {/* Tabs Navigation */}
          <div className="menu-tabs">
            {venueTabs.map((tab, tabIndex) => (
              <button
                key={tabIndex}
                className={`menu-tab ${activeVenueTab === tabIndex ? 'active' : ''}`}
                onClick={() => setActiveVenueTab(tabIndex)}
              >
                {tab.areaName}
              </button>
            ))}
          </div>
        
          <div className="row-lg">
            <div className="col-6-12_lg menu-content">
              {/* Active Tab Content */}
              {venueTabs[activeVenueTab] && (
                <div className="menu-tab-content">
                  <div className="menu-tab-header">
                    {venueTabs[activeVenueTab].areaName && (
                      <h5 className="venue-title">{venueTabs[activeVenueTab].areaName}</h5>
                    )}

                    {venueTabs[activeVenueTab].areaDescription && venueTabs[activeVenueTab].areaDescription!.length > 0 && (
                      <div className="venue-description">
                        <PortableText value={venueTabs[activeVenueTab].areaDescription} />
                      </div>
                    )}
                  </div>

                  {venueTabs[activeVenueTab].specs && venueTabs[activeVenueTab].specs!.length > 0 && (
                    <div className="venue-specs">
                      {venueTabs[activeVenueTab].specs!.map((spec, specIndex) => (
                        <div key={specIndex} className="venue-spec">
                          {spec.specName && (
                            <div className="venue-spec-name">{spec.specName}</div>
                          )}
                          {spec.specDescription && spec.specDescription.length > 0 && (
                            <div className="venue-spec-description">
                              <PortableText value={spec.specDescription} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {venueTabs[activeVenueTab]?.image && (
              <div className="col-6-12_lg menu-image">
                <div className="media-wrap">
                  <img 
                    key={`venue-tab-image-${activeVenueTab}`}
                    data-src={urlFor(venueTabs[activeVenueTab].image!).url()} 
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
    </section>
  )
}

