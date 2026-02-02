import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { client } from "../../sanity.client";
import { metadataQuery } from "../sanity/lib/queries";
import { urlFor } from "../sanity/utils/imageUrlBuilder";
import BodyFadeIn from "../components/BodyFadeIn";

export const revalidate = 0

// Generate metadata dynamically from Sanity CMS
export async function generateMetadata(): Promise<Metadata> {
  const metaData = await client.fetch(metadataQuery);
  
  // Build social image URL if available
  let socialImageUrl: string | undefined;
  if (metaData?.socialimage?.asset?._ref) {
    socialImageUrl = urlFor(metaData.socialimage).width(1200).height(630).url();
  }
  
  return {
    title: metaData?.title,
    description: metaData?.description,
    keywords: metaData?.keywords,
    authors: [{ name: "Inness" }],
    openGraph: {
      title: metaData?.title,
      description: metaData?.description,
      type: "website",
      locale: "en_US",
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaData?.title,
      description: metaData?.description,
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5ZRV23R');`,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5ZRV23R"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Script
          id="scroll-reset"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Fix Next.js 15 history.pushState error FIRST - before anything else
              // Some scripts call pushState with empty string, but Next.js expects an object
              (function() {
                // Store original before anything wraps it
                const originalPushState = History.prototype.pushState;
                const originalReplaceState = History.prototype.replaceState;
                
                // Helper to normalize state - must always return an object
                const normalizeState = function(state) {
                  // If state is a string (including empty string), convert to object
                  if (typeof state === 'string') {
                    return state ? { _original: state } : {};
                  }
                  // If state is null or undefined, return empty object
                  if (state === null || state === undefined) {
                    return {};
                  }
                  // If already an object, make sure it's not frozen/sealed
                  if (typeof state === 'object') {
                    try {
                      // Test if we can add a property
                      const testObj = Object.assign({}, state);
                      return testObj;
                    } catch (e) {
                      return {};
                    }
                  }
                  // Fallback for any other type
                  return {};
                };
                
                // Patch History.prototype.pushState
                History.prototype.pushState = function(state, title, url) {
                  const safeState = normalizeState(state);
                  
                  // Validate URL - catch Namastay SDK invalid URLs like //apiKey?params
                  if (url && typeof url === 'string') {
                    // Invalid: starts with // but isn't a proper protocol-relative URL
                    if (url.startsWith('//') && !url.startsWith('//www.') && !url.startsWith('//cdn.')) {
                      console.warn('Blocked invalid URL in pushState:', url);
                      return;
                    }
                  }
                  
                  try {
                    return originalPushState.call(this, safeState, title, url);
                  } catch (error) {
                    // If error occurs, silently suppress
                    return;
                  }
                };
                
                // Also patch replaceState in case it's used
                History.prototype.replaceState = function(state, title, url) {
                  const safeState = normalizeState(state);
                  try {
                    return originalReplaceState.call(this, safeState, title, url);
                  } catch (error) {
                    return;
                  }
                };
                
                // Also patch window.history if it exists
                if (typeof window !== 'undefined' && window.history) {
                  window.history.pushState = History.prototype.pushState;
                  window.history.replaceState = History.prototype.replaceState;
                }
                
                // Re-apply patch after other scripts load, in case they wrap our version
                setTimeout(function() {
                  if (window.history) {
                    window.history.pushState = History.prototype.pushState;
                    window.history.replaceState = History.prototype.replaceState;
                  }
                }, 100);
                
                setTimeout(function() {
                  if (window.history) {
                    window.history.pushState = History.prototype.pushState;
                    window.history.replaceState = History.prototype.replaceState;
                  }
                }, 1000);
              })();
              
              // Reset scroll position immediately before anything else runs
              window.scrollTo(0, 0);
              // Disable scroll restoration to prevent browser from restoring scroll position
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              // Add class to body immediately on homepage to trigger CSS hiding of header
              if (window.location.pathname === '/' || window.location.pathname === '') {
                (function() {
                  function applyHomepageClasses() {
                    document.body.classList.add('page-home-loader-active');
                    const headers = document.querySelectorAll('.site-header');
                    headers.forEach(function(header) {
                      header.classList.add('is-translated-up');
                    });
                  }
                  
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', applyHomepageClasses, false);
                  } else {
                    applyHomepageClasses();
                  }
                })();
              }
            `
          }}
        />
        <Script
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
          strategy="afterInteractive"
        />
        {/* Namastay Booking Script - Step 1 */}
        <Script
          id="namastay-script"
          src="https://sdk.namastay.io/index.js"
          strategy="afterInteractive"
        />
        {/* Namastay Initialization */}
        <Script
          id="namastay-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var namastayRetryCount = 0;
                var maxRetries = 20;
                
                function initializeNamastay() {
                  if (namastayRetryCount >= maxRetries) {
                    console.log('⚠️ Namastay SDK failed to load after ' + maxRetries + ' attempts');
                    return;
                  }
                  
                  namastayRetryCount++;
                  
                  if (typeof window.initNamastay === 'function') {
                    console.log('✅ Namastay SDK loaded, initializing...');
                    
                    var hotelParameters = {
                      apiKey: '6e1a1ee72c854f43b9bcb4113572e824nuuwro4cfvmrd62b',
                      spreedlyApiKey: 'D1a8Zma8lZfap6nZpUjPxp6OHBV',
                      widgetButtonsClass: 'namastay-widget-button',
                      specialOfferButtonsClass: 'namastay-offer-button',
                    };
                    
                    try {
                      window.initNamastay(hotelParameters);
                      console.log('✅ Namastay initialized successfully');
                    } catch (error) {
                      console.error('❌ Error initializing Namastay:', error);
                    }
                  } else {
                    // SDK not loaded yet, retry
                    setTimeout(initializeNamastay, 200);
                  }
                }
                
                // Start initialization after a short delay
                setTimeout(initializeNamastay, 500);
              })();
            `
          }}
        />
        <Script
          id="viewport-detection"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function waitForJQuery(callback) {
                  if (typeof window.jQuery !== 'undefined') {
                    callback(window.jQuery);
                  } else {
                    setTimeout(function() {
                      waitForJQuery(callback);
                    }, 100);
                  }
                }
                
                waitForJQuery(function($) {
                  // Ensure $ is available globally for this code
                  if (typeof window.$ === 'undefined') {
                    window.$ = $;
                  }
                  
                  // The inViewport plugin code by Moob
                  (function ($) {
                    var vph=0;
                    function getViewportDimensions(){
                        vph = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                    }
                    getViewportDimensions();    
                    $(window).on('resize orientationChanged', function(){
                        getViewportDimensions();
                    });            
                    
                    $.fn.inViewport = function (whenInView, whenNotInView) {                  
                        return this.each(function () {
                            var el = $(this),
                                inviewalreadycalled = false,
                                notinviewalreadycalled = false;                            
                            $(window).on('resize orientationChanged scroll', function(){
                                checkInView();
                            });               
                            function checkInView(){
                                var rect = el[0].getBoundingClientRect(),
                                    t = rect.top,
                                    b = rect.bottom;
                                if(t<vph && b>0){
                                    if(!inviewalreadycalled){
                                        whenInView.call(el);
                                        inviewalreadycalled = true;
                                        notinviewalreadycalled = false;
                                    }
                                } else {
                                    if(!notinviewalreadycalled){
                                        whenNotInView.call(el);
                                        notinviewalreadycalled = true;
                                        inviewalreadycalled = false;
                                    }
                                }
                            }
                            // Delay initial check to avoid hydration mismatch - wait for React to finish hydrating
                            requestAnimationFrame(function() {
                                requestAnimationFrame(function() {
                                    checkInView();
                                });
                            });                
                        });
                    }             
                  }($));
                  
                  // Initialize the viewport detection
                  function outOfView() {
                    $('.out-of-view, .out-of-opacity').inViewport(
                      function(){
                        $(this).addClass("am-in-view in-view-detect");
                      },
                      function(){
                        $(this).removeClass("in-view-detect");
                      }
                    );
                  }
                  
                  function initScaleImages() {
                    if (typeof window === 'undefined' || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
                      return;
                    }

                    // Only run on desktop (width > 820px)
                    if (window.innerWidth <= 768) {
                      return;
                    }

                    if (!window.__gsapScrollTriggerRegistered) {
                      window.gsap.registerPlugin(window.ScrollTrigger);
                      window.__gsapScrollTriggerRegistered = true;
                    }

                    window.gsap.utils.toArray('.scale-element').forEach(function(image) {
                      if (!image.closest('.scale-container')) {
                        return;
                      }

                      if (image.dataset.scaleImageInitialized === 'true') {
                        return;
                      }

                      // Use setTimeout to ensure React hydration is complete
                      // This prevents GSAP from adding inline styles and data attributes during hydration
                      setTimeout(function() {
                        if (!image.closest('.scale-container')) {
                          return;
                        }
                        
                        // Check again in case it was initialized elsewhere
                        if (image.dataset.scaleImageInitialized === 'true') {
                          return;
                        }
                        
                        // Mark as initialized and create GSAP animation
                        image.dataset.scaleImageInitialized = 'true';
                        
                        window.gsap.to(image, {
                          startAt: {
                            scale: 1,
                            x: 0,
                            y: 0
                          },
                          scale: 1.05,
                          x: 20,
                          y: -20,
                          ease: "none",
                          immediateRender: false,
                          scrollTrigger: {
                            trigger: image.closest('.scale-container'),
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                          }
                        });
                      }, 300);
                    });
                  }

                  function initHeroSectionMovement() {
                    try {
                      if (typeof window === 'undefined' || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
                        return;
                      }

                      // Only run on desktop (width > 820px)
                      if (window.innerWidth <= 768) {
                        return;
                      }

                      if (!window.__gsapScrollTriggerRegistered) {
                        window.gsap.registerPlugin(window.ScrollTrigger);
                        window.__gsapScrollTriggerRegistered = true;
                      }

                      window.gsap.utils.toArray('.hero-section.layout-1').forEach(function(heroSection) {
                        // Skip if this is not actually a hero section or if it's the header
                        if (!heroSection || heroSection.classList.contains('site-header')) {
                          return;
                        }

                        const imageWrap = heroSection.querySelector('.fill-space-image-wrap');
                        if (!imageWrap) {
                          return;
                        }

                        if (imageWrap.dataset.heroMovementInitialized === 'true') {
                          return;
                        }

                        imageWrap.dataset.heroMovementInitialized = 'true';

                        window.gsap.to(imageWrap, {
                          startAt: {
                            scale: 1,
                            x: 0,
                            y: 0
                          },
                          scale: 1.05,
                          x: 20,
                          y: -20,
                          ease: "none",
                          immediateRender: false,
                          scrollTrigger: {
                            trigger: heroSection,
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                          }
                        });
                      });
                    } catch (error) {
                      console.error('Error initializing hero section movement:', error);
                    }
                  }

                  // Run when DOM is ready, but delay to avoid hydration mismatch
                  $(document).ready(function() {
                    // Wait for document to be fully loaded and add extra delay for React hydration
                    function runAfterHydration() {
                      // Use multiple requestAnimationFrame calls plus a small timeout
                      // to ensure React has finished hydrating
                      requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                          setTimeout(function() {
                            outOfView();
                            initScaleImages();
                            initHeroSectionMovement();
                          }, 100);
                        });
                      });
                    }
                    
                    if (document.readyState === 'complete') {
                      runAfterHydration();
                    } else {
                      window.addEventListener('load', runAfterHydration, { once: true });
                      // Also run after a timeout as fallback
                      setTimeout(runAfterHydration, 500);
                    }
                  });
                  
                    // Re-run on browser navigation (back/forward)
                    window.addEventListener('popstate', function() {
                      setTimeout(outOfView, 100);
                      setTimeout(initScaleImages, 100);
                      setTimeout(initHeroSectionMovement, 100);
                    });
                    
                    // Re-run on Next.js route changes
                    // Use MutationObserver to detect DOM changes
                    const observer = new MutationObserver(function(mutations) {
                      let shouldReRun = false;
                      mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                          // Check if any added nodes contain elements with our classes
                          mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                              if (node.classList && (node.classList.contains('out-of-view') || node.classList.contains('out-of-opacity'))) {
                                shouldReRun = true;
                              }
                              // Also check child elements
                              if (node.querySelector && (node.querySelector('.out-of-view') || node.querySelector('.out-of-opacity'))) {
                                shouldReRun = true;
                              }
                            }
                          });
                        }
                      });
                      
                      if (shouldReRun) {
                        setTimeout(outOfView, 100);
                        setTimeout(initScaleImages, 100);
                        setTimeout(initHeroSectionMovement, 100);
                      }
                    });
                    
                    // Start observing
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true
                    });
                    
                    // Smooth scroll functionality for hash links
                    function initSmoothScroll() {
                      // Handle initial page load with hash
                      if (window.location.hash) {
                        setTimeout(function() {
                          const target = document.querySelector(window.location.hash);
                          if (target) {
                            target.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }, 100);
                      }
                      
                      // Handle clicks on links with hash
                      $(document).on('click', 'a[href*="#"]', function(e) {
                        const href = $(this).attr('href');
                        if (href && href.includes('#')) {
                          const hash = href.split('#')[1];
                          const target = document.getElementById(hash);
                          
                          if (target) {
                            e.preventDefault();
                            target.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                            
                            // Update URL without triggering scroll
                            history.pushState(null, null, href);
                          }
                        }
                      });
                      
                      // Handle browser back/forward with hash
                      window.addEventListener('popstate', function() {
                        if (window.location.hash) {
                          setTimeout(function() {
                            const target = document.querySelector(window.location.hash);
                            if (target) {
                              target.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }, 100);
                        }
                      });
                    }
                    
                    // Initialize smooth scroll
                    initSmoothScroll();
                    // Note: initScaleImages() and initHeroSectionMovement() are called in $(document).ready() 
                    // with proper delays to avoid hydration mismatches
                });
              })();
            `
          }}
        />
        <BodyFadeIn />
        {children}
      </body>
    </html>
  );
}
