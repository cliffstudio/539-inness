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
      <body>
        <Script
          id="scroll-reset"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Reset scroll position immediately before anything else runs
              window.scrollTo(0, 0);
              // Disable scroll restoration to prevent browser from restoring scroll position
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
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
                            checkInView();                
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

                    // Only run on desktop (width > 768px)
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

                      image.dataset.scaleImageInitialized = 'true';

                      window.gsap.to(image, {
                        scale: 1.05,
                        x: 20,
                        y: -20,
                        ease: "none",
                        scrollTrigger: {
                          trigger: image.closest('.scale-container'),
                          start: "top bottom",
                          end: "bottom top",
                          scrub: true
                        }
                      });
                    });
                  }

                  function initHeroSectionMovement() {
                    try {
                      if (typeof window === 'undefined' || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
                        return;
                      }

                      // Only run on desktop (width > 768px)
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
                          scale: 1.05,
                          x: 20,
                          y: -20,
                          ease: "none",
                          scrollTrigger: {
                            trigger: heroSection,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                          }
                        });
                      });
                    } catch (error) {
                      console.error('Error initializing hero section movement:', error);
                    }
                  }

                  // Run when DOM is ready
                  $(document).ready(function() {
                    outOfView();
                    initScaleImages();
                    initHeroSectionMovement();
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
                    initScaleImages();
                    initHeroSectionMovement();
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
