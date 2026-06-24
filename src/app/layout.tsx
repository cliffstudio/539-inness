import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { client } from "../../sanity.client";
import { siteSettingsQuery } from "../sanity/lib/queries";
import { urlFor } from "../sanity/utils/imageUrlBuilder";
import BodyFadeIn from "../components/BodyFadeIn";
import PageAnimations from "../components/PageAnimations";
import NamastayInit from "../components/NamastayInit";

export const revalidate = 0;

// Generate metadata dynamically from Sanity CMS
export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await client.fetch(siteSettingsQuery);

  // Build social image URL if available
  let socialImageUrl: string | undefined;
  if (siteSettings?.socialimage?.asset?._ref) {
    socialImageUrl = urlFor(siteSettings.socialimage)
      .width(1200)
      .height(630)
      .url();
  }

  return {
    title: siteSettings?.title,
    description: siteSettings?.description,
    authors: [{ name: "Inness" }],
    openGraph: {
      title: siteSettings?.title,
      description: siteSettings?.description,
      type: "website",
      locale: "en_US",
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
    twitter: {
      card: "summary_large_image",
      title: siteSettings?.title,
      description: siteSettings?.description,
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
    <html lang="en" suppressHydrationWarning>
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
            style={{ display: "none", visibility: "hidden" }}
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
                  // Apply as early as possible (before first paint) to avoid the header
                  // animating away on initial load. We set the class on <html> so CSS
                  // can take effect even before <body> and the header exist.
                  document.documentElement.classList.add('page-home-loader-active');

                  function applyHomepageClassesWhenAvailable() {
                    if (document.body) {
                      document.body.classList.add('page-home-loader-active');
                    }

                    var headers = document.querySelectorAll('.site-header');
                    if (headers && headers.length) {
                      headers.forEach(function(header) {
                        header.classList.add('is-translated-up');
                      });
                      return true;
                    }
                    return false;
                  }

                  // Try immediately, then keep trying for a short window until header mounts.
                  if (!applyHomepageClassesWhenAvailable()) {
                    var attempts = 0;
                    (function tick() {
                      attempts++;
                      if (applyHomepageClassesWhenAvailable() || attempts > 60) return; // ~1s @ 60fps
                      requestAnimationFrame(tick);
                    })();
                  }
                })();
              }
            `,
          }}
        />
        <NamastayInit />
        <BodyFadeIn />
        <PageAnimations />
        {children}
      </body>
    </html>
  );
}
