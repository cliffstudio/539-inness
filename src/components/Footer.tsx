'use client'

import { MouseEvent, useEffect, useState } from 'react'
import Script from 'next/script'
import type { Footer, Link as FooterLink } from '../types/footerSettings'
import { BookingTab, useBooking } from '../contexts/BookingContext'
import { getLinkInfo } from '../utils/linkHelpers'

interface FooterProps {
  footer: Footer
}

export default function Footer({ footer }: FooterProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { openBooking } = useBooking()

  // Add Mailchimp CSS to head
  useEffect(() => {
    // Check if link already exists
    const existingLink = document.querySelector('link[href="//cdn-images.mailchimp.com/embedcode/classic-061523.css"]')
    if (existingLink) {
      return // Link already exists, no need to add it again
    }

    const link = document.createElement('link')
    link.href = '//cdn-images.mailchimp.com/embedcode/classic-061523.css'
    link.rel = 'stylesheet'
    link.type = 'text/css'
    document.head.appendChild(link)
  }, [])

  // Listen for Mailchimp success callback
  useEffect(() => {
    // Mailchimp callback function
    const handleSuccess = () => {
      setIsSubscribed(true)
      // Wait for fade out animation (500ms) before showing success message
      setTimeout(() => {
        setShowSuccess(true)
      }, 500)
    }

    // Attach to window for Mailchimp to call
    ;(window as typeof window & { mce_success_callback?: () => void }).mce_success_callback = handleSuccess

    // Also listen for the success response element changes
    const checkSuccessResponse = () => {
      const successElement = document.getElementById('mce-success-response')
      if (successElement && successElement.style.display !== 'none' && successElement.innerHTML.trim() !== '') {
        setIsSubscribed(true)
        // Wait for fade out animation (500ms) before showing success message
        setTimeout(() => {
          setShowSuccess(true)
        }, 500)
      }
    }

    // Check periodically for success response
    const interval = setInterval(checkSuccessResponse, 500)

    // Also observe changes to the success response element
    const successElement = document.getElementById('mce-success-response')
    if (successElement) {
      const observer = new MutationObserver(() => {
        checkSuccessResponse()
      })
      observer.observe(successElement, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        subtree: true,
      })

      return () => {
        clearInterval(interval)
        observer.disconnect()
      }
    }

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!footer) return null

  const isPlainLeftClick = (event: MouseEvent<HTMLAnchorElement>) => {
    return (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    )
  }

  const renderFooterLink = (link: FooterLink, linkIndex: number) => {
    const { href, text } = getLinkInfo(link)
    if (!text) return null

    if (link.linkType === 'booking') {
      const bookingTab = (link.bookingTab || 'room') as BookingTab
      const bookingHref = href || '#booking'
      const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!isPlainLeftClick(event)) return
        event.preventDefault()
        openBooking(bookingTab)
      }

      return (
        <div key={linkIndex}>
          <a
            href={bookingHref}
            className="site-footer__link"
            onClick={handleClick}
          >
            {text}
          </a>
        </div>
      )
    }

    if (!href) return null

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
  }

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
                {footer.navigationColumn1.links.map(renderFooterLink)}
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
                {footer.navigationColumn2.links.map(renderFooterLink)}
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
                {footer.followColumn.links.map(renderFooterLink)}
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

      <div className="row-lg bottom">
        <div className="col-6-12_lg">
          <div id="mc_embed_shell">
            <div id="mc_embed_signup">
              <form
                action="https://gmail.us17.list-manage.com/subscribe/post?u=8cd9e0f1870a63895c30dd793&amp;id=79ad2b8403&amp;f_id=0018e1e3f0"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                className="validate"
                target="_blank"
                noValidate
              >
                <div id="mc_embed_signup_scroll">
                  <div className="body-big site-footer__newsletter-heading">Sign up for our newsletter</div>
                  <div className="site-footer__newsletter-form-container">
                    <div className={`form-wrap ${isSubscribed ? 'fade-out' : ''}`}>
                      <input
                        type="email"
                        name="EMAIL"
                        className="required email"
                        id="mce-EMAIL"
                        autoComplete="email"
                        required
                        placeholder="Your Email Address"
                      />
                      <input
                        type="submit"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="button button--outline"
                        value="Submit"
                      />
                    </div>
                    {showSuccess && (
                      <div className="site-footer__newsletter-success fade-in">
                        <p>Thank you for subscribing</p>
                      </div>
                    )}
                  </div>
                  <div id="mce-responses" className="clear">
                    <div
                      className="response"
                      id="mce-error-response"
                      style={{ display: 'none' }}
                    />
                    <div
                      className="response"
                      id="mce-success-response"
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                    <input
                      type="text"
                      name="b_8cd9e0f1870a63895c30dd793_79ad2b8403"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </form>
            </div>
            <Script
              src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"
              strategy="afterInteractive"
            />
            <Script
              id="mailchimp-validation"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    function initMailchimp() {
                      if (typeof jQuery === 'undefined') {
                        setTimeout(initMailchimp, 100);
                        return;
                      }
                      
                      (function($) {
                        window.fnames = new Array();
                        window.ftypes = new Array();
                        fnames[0]='EMAIL';
                        ftypes[0]='email';
                        fnames[1]='FNAME';
                        ftypes[1]='text';
                        fnames[2]='LNAME';
                        ftypes[2]='text';
                        fnames[3]='ADDRESS';
                        ftypes[3]='address';
                        fnames[4]='PHONE';
                        ftypes[4]='phone';
                        fnames[5]='BIRTHDAY';
                        ftypes[5]='birthday';
                      }(jQuery));
                      var $mcj = jQuery.noConflict(true);

                      // SMS Phone Multi-Country Functionality
                      if(!window.MC) {
                        window.MC = {};
                      }
                      window.MC.smsPhoneData = {
                        defaultCountryCode: 'US',
                        programs: [],
                        smsProgramDataCountryNames: []
                      };

                      function getCountryUnicodeFlag(countryCode) {
                         return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
                      };

                      // HTML sanitization function to prevent XSS
                      function sanitizeHtml(str) {
                        if (typeof str !== 'string') return '';
                        return str
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/'/g, '&#x27;')
                          .replace(/\\//g, '&#x2F;');
                      }

                      // URL sanitization function to prevent javascript: and data: URLs
                      function sanitizeUrl(url) {
                        if (typeof url !== 'string') return '';
                        const trimmedUrl = url.trim().toLowerCase();
                        if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('vbscript:')) {
                          return '#';
                        }
                        return url;
                      }

                      const getBrowserLanguage = () => {
                        if (!window?.navigator?.language?.split('-')[1]) {
                          return window?.navigator?.language?.toUpperCase();
                        }
                        return window?.navigator?.language?.split('-')[1];
                      };

                      function getDefaultCountryProgram(defaultCountryCode, smsProgramData) {
                        if (!smsProgramData || smsProgramData.length === 0) {
                          return null;
                        }

                        const browserLanguage = getBrowserLanguage();

                        if (browserLanguage) {
                          const foundProgram = smsProgramData.find(
                            (program) => program?.countryCode === browserLanguage,
                          );
                          if (foundProgram) {
                            return foundProgram;
                          }
                        }

                        if (defaultCountryCode) {
                          const foundProgram = smsProgramData.find(
                            (program) => program?.countryCode === defaultCountryCode,
                          );
                          if (foundProgram) {
                            return foundProgram;
                          }
                        }

                        return smsProgramData[0];
                      }

                      function updateSmsLegalText(countryCode, fieldName) {
                        if (!countryCode || !fieldName) {
                          return;
                        }
                        
                        const programs = window?.MC?.smsPhoneData?.programs;
                        if (!programs || !Array.isArray(programs)) {
                          return;
                        }
                        
                        const program = programs.find(program => program?.countryCode === countryCode);
                        if (!program || !program.requiredTemplate) {
                          return;
                        }
                        
                        const legalTextElement = document.querySelector('#legal-text-' + fieldName);
                        if (!legalTextElement) {
                          return;
                        }
                        
                        // Remove HTML tags and clean up the text
                        const divRegex = new RegExp('</?[div][^>]*>', 'gi');
                        const fullAnchorRegex = new RegExp('<a.*?</a>', 'g');
                        const anchorRegex = new RegExp('<a href="(.*?)" target="(.*?)">(.*?)</a>');
                        
                        const requiredLegalText = program.requiredTemplate
                          .replace(divRegex, '')
                          .replace(fullAnchorRegex, '')
                          .slice(0, -1);
                        
                        const anchorMatches = program.requiredTemplate.match(anchorRegex);
                        
                        if (anchorMatches && anchorMatches.length >= 4) {
                          // Create link element safely using DOM methods instead of innerHTML
                          const linkElement = document.createElement('a');
                          linkElement.href = sanitizeUrl(anchorMatches[1]);
                          linkElement.target = sanitizeHtml(anchorMatches[2]);
                          linkElement.textContent = sanitizeHtml(anchorMatches[3]);
                          
                          legalTextElement.textContent = requiredLegalText + ' ';
                          legalTextElement.appendChild(linkElement);
                          legalTextElement.appendChild(document.createTextNode('.'));
                        } else {
                          legalTextElement.textContent = requiredLegalText + '.';
                        }
                      }

                      function generateDropdownOptions(smsProgramData) {
                        if (!smsProgramData || smsProgramData.length === 0) {
                          return '';
                        }
                        
                        return smsProgramData.map(program => {
                          const flag = getCountryUnicodeFlag(program.countryCode);
                          const countryName = getCountryName(program.countryCode);
                          const callingCode = program.countryCallingCode || '';
                          // Sanitize all values to prevent XSS
                          const sanitizedCountryCode = sanitizeHtml(program.countryCode || '');
                          const sanitizedCountryName = sanitizeHtml(countryName || '');
                          const sanitizedCallingCode = sanitizeHtml(callingCode || '');
                          return '<option value="' + sanitizedCountryCode + '">' + sanitizedCountryName + ' ' + sanitizedCallingCode + '</option>';
                        }).join('');
                      }

                      function getCountryName(countryCode) {
                        if (window.MC?.smsPhoneData?.smsProgramDataCountryNames && Array.isArray(window.MC.smsPhoneData.smsProgramDataCountryNames)) {
                          for (let i = 0; i < window.MC.smsPhoneData.smsProgramDataCountryNames.length; i++) {
                            if (window.MC.smsPhoneData.smsProgramDataCountryNames[i].code === countryCode) {
                              return window.MC.smsPhoneData.smsProgramDataCountryNames[i].name;
                            }
                          }
                        }
                        return countryCode;
                      }

                      function getDefaultPlaceholder(countryCode) {
                        if (!countryCode || typeof countryCode !== 'string') {
                          return '+1 000 000 0000'; // Default US placeholder
                        }
                        
                        const mockPlaceholders = [
                          {
                            countryCode: 'US',
                            placeholder: '+1 000 000 0000',
                            helpText: 'Include the US country code +1 before the phone number',
                          },
                          {
                            countryCode: 'GB',
                            placeholder: '+44 0000 000000',
                            helpText: 'Include the GB country code +44 before the phone number',
                          },
                          {
                            countryCode: 'CA',
                            placeholder: '+1 000 000 0000',
                            helpText: 'Include the CA country code +1 before the phone number',
                          },
                          {
                            countryCode: 'AU',
                            placeholder: '+61 000 000 000',
                            helpText: 'Include the AU country code +61 before the phone number',
                          },
                          {
                            countryCode: 'DE',
                            placeholder: '+49 000 0000000',
                            helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
                          },
                          {
                            countryCode: 'FR',
                            placeholder: '+33 0 00 00 00 00',
                            helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
                          },
                          {
                            countryCode: 'ES',
                            placeholder: '+34 000 000 000',
                            helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
                          },
                          {
                            countryCode: 'NL',
                            placeholder: '+31 0 00000000',
                            helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
                          },
                          {
                            countryCode: 'BE',
                            placeholder: '+32 000 00 00 00',
                            helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
                          },
                          {
                            countryCode: 'CH',
                            placeholder: '+41 00 000 00 00',
                            helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
                          },
                          {
                            countryCode: 'AT',
                            placeholder: '+43 000 000 0000',
                            helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
                          },
                          {
                            countryCode: 'IE',
                            placeholder: '+353 00 000 0000',
                            helpText: 'Include the IE country code +353 before the phone number',
                          },
                          {
                            countryCode: 'IT',
                            placeholder: '+39 000 000 0000',
                            helpText: 'Includere il prefisso internazionale IT +39 prima del numero di telefono',
                          },
                        ];

                        const selectedPlaceholder = mockPlaceholders.find(function(item) {
                          return item && item.countryCode === countryCode;
                        });
                        
                        return selectedPlaceholder ? selectedPlaceholder.placeholder : mockPlaceholders[0].placeholder;
                      }

                      function updatePlaceholder(countryCode, fieldName) {
                        if (!countryCode || !fieldName) {
                          return;
                        }
                        
                        const phoneInput = document.querySelector('#mce-' + fieldName);
                        if (!phoneInput) {
                          return;
                        }
                        
                        const placeholder = getDefaultPlaceholder(countryCode);
                        if (placeholder) {
                          phoneInput.placeholder = placeholder;
                        }
                      }

                      function updateCountryCodeInstruction(countryCode, fieldName) {
                        updatePlaceholder(countryCode, fieldName);
                      }

                      function getDefaultHelpText(countryCode) {
                        const mockPlaceholders = [
                          {
                            countryCode: 'US',
                            placeholder: '+1 000 000 0000',
                            helpText: 'Include the US country code +1 before the phone number',
                          },
                          {
                            countryCode: 'GB',
                            placeholder: '+44 0000 000000',
                            helpText: 'Include the GB country code +44 before the phone number',
                          },
                          {
                            countryCode: 'CA',
                            placeholder: '+1 000 000 0000',
                            helpText: 'Include the CA country code +1 before the phone number',
                          },
                          {
                            countryCode: 'AU',
                            placeholder: '+61 000 000 000',
                            helpText: 'Include the AU country code +61 before the phone number',
                          },
                          {
                            countryCode: 'DE',
                            placeholder: '+49 000 0000000',
                            helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
                          },
                          {
                            countryCode: 'FR',
                            placeholder: '+33 0 00 00 00 00',
                            helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
                          },
                          {
                            countryCode: 'ES',
                            placeholder: '+34 000 000 000',
                            helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
                          },
                          {
                            countryCode: 'NL',
                            placeholder: '+31 0 00000000',
                            helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
                          },
                          {
                            countryCode: 'BE',
                            placeholder: '+32 000 00 00 00',
                            helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
                          },
                          {
                            countryCode: 'CH',
                            placeholder: '+41 00 000 00 00',
                            helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
                          },
                          {
                            countryCode: 'AT',
                            placeholder: '+43 000 000 0000',
                            helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
                          },
                          {
                            countryCode: 'IE',
                            placeholder: '+353 00 000 0000',
                            helpText: 'Include the IE country code +353 before the phone number',
                          },
                          {
                            countryCode: 'IT',
                            placeholder: '+39 000 000 0000',
                            helpText: 'Includere il prefisso internazionale IT +39 prima del numero di telefono',
                          },
                        ];
                        
                        if (!countryCode || typeof countryCode !== 'string') {
                          return mockPlaceholders[0].helpText;
                        }
                        
                        const selectedHelpText = mockPlaceholders.find(function(item) {
                            return item && item.countryCode === countryCode;
                          });
                          
                          return selectedHelpText ? selectedHelpText.helpText : mockPlaceholders[0].helpText;
                      }

                      function setDefaultHelpText(countryCode) {
                        const helpTextSpan = document.querySelector('#help-text');
                        if (!helpTextSpan) {
                          return;
                        }
                      }

                      function updateHelpTextCountryCode(countryCode, fieldName) {
                        if (!countryCode || !fieldName) {
                          return;
                        }
                        
                        setDefaultHelpText(countryCode);
                      }

                      function initializeSmsPhoneDropdown(fieldName) {
                        if (!fieldName || typeof fieldName !== 'string') {
                          return;
                        }
                        
                        const dropdown = document.querySelector('#country-select-' + fieldName);
                        const displayFlag = document.querySelector('#flag-display-' + fieldName);
                        
                        if (!dropdown || !displayFlag) {
                          return;
                        }

                        const smsPhoneData = window.MC?.smsPhoneData;
                        if (smsPhoneData && smsPhoneData.programs && Array.isArray(smsPhoneData.programs)) {
                          dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
                        }

                        const defaultProgram = getDefaultCountryProgram(smsPhoneData?.defaultCountryCode, smsPhoneData?.programs);
                        if (defaultProgram && defaultProgram.countryCode) {
                          dropdown.value = defaultProgram.countryCode;
                          
                          const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
                          if (flagSpan) {
                            flagSpan.textContent = getCountryUnicodeFlag(defaultProgram.countryCode);
                            flagSpan.setAttribute('aria-label', sanitizeHtml(defaultProgram.countryCode) + ' flag');
                          }
                          
                          updateSmsLegalText(defaultProgram.countryCode, fieldName);
                          updatePlaceholder(defaultProgram.countryCode, fieldName);
                          updateCountryCodeInstruction(defaultProgram.countryCode, fieldName);
                        }

                        var smsNotRequiredRemoveCountryCodeEnabled = true;
                        var smsField = Object.values({"EMAIL":{"name":"EMAIL","label":"Email Address","helper_text":"","merge_id":0,"type":"email","required":true,"audience_field_name":"Email Address","field_type":"merge","enabled":true,"order":null},"FNAME":{"name":"FNAME","label":"First Name","helper_text":"","type":"text","required":false,"audience_field_name":"First Name","enabled":false,"order":null,"field_type":"merge","merge_id":1},"LNAME":{"name":"LNAME","label":"Last Name","helper_text":"","type":"text","required":false,"audience_field_name":"Last Name","enabled":false,"order":null,"field_type":"merge","merge_id":2},"ADDRESS":{"name":"ADDRESS","label":"Address","helper_text":"","type":"address","required":false,"audience_field_name":"Address","enabled":false,"order":null,"field_type":"merge","merge_id":3,"countries":{"2":"Albania","3":"Algeria","4":"Andorra","5":"Angola","6":"Argentina","7":"Armenia","8":"Australia","9":"Austria","10":"Azerbaijan","11":"Bahamas","12":"Bahrain","13":"Bangladesh","14":"Barbados","15":"Belarus","16":"Belgium","17":"Belize","18":"Benin","19":"Bermuda","20":"Bhutan","21":"Bolivia","22":"Bosnia and Herzegovina","23":"Botswana","24":"Brazil","25":"Bulgaria","26":"Burkina Faso","27":"Burundi","28":"Cambodia","29":"Cameroon","30":"Canada","31":"Cape Verde","32":"Cayman Islands","33":"Central African Republic","34":"Chad","35":"Chile","36":"China","37":"Colombia","38":"Congo","40":"Croatia","41":"Cyprus","42":"Czech Republic","43":"Denmark","44":"Djibouti","45":"Ecuador","46":"Egypt","47":"El Salvador","48":"Equatorial Guinea","49":"Eritrea","50":"Estonia","51":"Ethiopia","52":"Fiji","53":"Finland","54":"France","56":"Gabon","57":"Gambia","58":"Georgia","59":"Germany","60":"Ghana","61":"Greece","62":"Guam","63":"Guinea","64":"Guinea-Bissau","65":"Guyana","66":"Honduras","67":"Hong Kong","68":"Hungary","69":"Iceland","70":"India","71":"Indonesia","74":"Ireland","75":"Israel","76":"Italy","78":"Japan","79":"Jordan","80":"Kazakhstan","81":"Kenya","82":"Kuwait","83":"Kyrgyzstan","84":"Lao People's Democratic Republic","85":"Latvia","86":"Lebanon","87":"Lesotho","88":"Liberia","90":"Liechtenstein","91":"Lithuania","92":"Luxembourg","93":"Macedonia","94":"Madagascar","95":"Malawi","96":"Malaysia","97":"Maldives","98":"Mali","99":"Malta","100":"Mauritania","101":"Mexico","102":"Moldova","103":"Monaco","104":"Mongolia","105":"Morocco","106":"Mozambique","107":"Namibia","108":"Nepal","109":"Netherlands","110":"Netherlands Antilles","111":"New Zealand","112":"Nicaragua","113":"Niger","114":"Nigeria","116":"Norway","117":"Oman","118":"Pakistan","119":"Panama","120":"Paraguay","121":"Peru","122":"Philippines","123":"Poland","124":"Portugal","126":"Qatar","127":"Reunion","128":"Romania","129":"Russia","130":"Rwanda","132":"Samoa (Independent)","133":"Saudi Arabia","134":"Senegal","135":"Seychelles","136":"Sierra Leone","137":"Singapore","138":"Slovakia","139":"Slovenia","140":"Somalia","141":"South Africa","142":"South Korea","143":"Spain","144":"Sri Lanka","146":"Suriname","147":"Swaziland","148":"Sweden","149":"Switzerland","152":"Taiwan","153":"Tanzania","154":"Thailand","155":"Togo","156":"Tunisia","157":"Turkiye","158":"Turkmenistan","159":"Uganda","161":"Ukraine","162":"United Arab Emirates","163":"Uruguay","164":"USA","165":"Uzbekistan","166":"Vatican City State (Holy See)","167":"Venezuela","168":"Vietnam","169":"Virgin Islands (British)","170":"Yemen","173":"Zambia","174":"Zimbabwe","175":"Antigua And Barbuda","176":"Anguilla","178":"American Samoa","179":"Aruba","180":"Brunei Darussalam","181":"Bouvet Island","183":"Cook Islands","185":"Christmas Island","187":"Dominican Republic","188":"Western Sahara","189":"Falkland Islands","191":"Faroe Islands","192":"Grenada","193":"French Guiana","194":"Gibraltar","195":"Greenland","196":"Guadeloupe","198":"Guatemala","200":"Haiti","202":"Jamaica","203":"Kiribati","204":"Comoros","205":"Saint Kitts and Nevis","206":"Saint Lucia","207":"Marshall Islands","208":"Macau","210":"Martinique","212":"Mauritius","213":"New Caledonia","214":"Norfolk Island","215":"Nauru","217":"Niue","219":"Papua New Guinea","221":"Pitcairn","222":"Palau","223":"Solomon Islands","225":"Svalbard and Jan Mayen Islands","227":"San Marino","232":"Tonga","233":"Timor-Leste","234":"Trinidad and Tobago","235":"Tuvalu","237":"Saint Vincent and the Grenadines","238":"Virgin Islands (U.S.)","239":"Vanuatu","241":"Mayotte","242":"Myanmar","255":"Sao Tome and Principe","257":"South Georgia and the South Sandwich Islands","260":"Tajikistan","262":"United Kingdom","268":"Costa Rica","270":"Guernsey","272":"North Korea","274":"Afghanistan","275":"Cote D'Ivoire","276":"Cuba","277":"French Polynesia","278":"Iran","279":"Iraq","281":"Libya","282":"Palestine","285":"Syria","286":"Aaland Islands","287":"Turks & Caicos Islands","288":"Jersey  (Channel Islands)","289":"Dominica","290":"Montenegro","293":"Sudan","294":"Montserrat","298":"Curacao","302":"Sint Maarten","311":"South Sudan","315":"Republic of Kosovo","318":"Congo, Democratic Republic of the","323":"Isle of Man","324":"Saint Martin","325":"Bonaire, Saint Eustatius and Saba","326":"Serbia"},"defaultcountry":164},"PHONE":{"name":"PHONE","label":"Phone Number","helper_text":"","type":"phone","required":false,"audience_field_name":"Phone Number","phoneformat":"none","enabled":false,"order":null,"field_type":"merge","merge_id":4},"BIRTHDAY":{"name":"BIRTHDAY","label":"Birthday","helper_text":"","type":"birthday","required":false,"audience_field_name":"Birthday","dateformat":"MM/DD","enabled":false,"order":null,"field_type":"merge","merge_id":5}}).find(function(f) { return f.name === fieldName && f.type === 'smsphone'; });
                        var isRequired = smsField ? smsField.required : false;
                        var shouldAppendCountryCode = smsNotRequiredRemoveCountryCodeEnabled ? isRequired : true;
                        
                        var phoneInput = document.querySelector('#mce-' + fieldName);
                        if (phoneInput && defaultProgram.countryCallingCode && shouldAppendCountryCode) {
                          phoneInput.value = defaultProgram.countryCallingCode;
                        }

                        displayFlag?.addEventListener('click', function(e) {
                          dropdown.focus();
                        });

                        dropdown?.addEventListener('change', function() {
                          const selectedCountry = this.value;
                          
                          if (!selectedCountry || typeof selectedCountry !== 'string') {
                            return;
                          }
                          
                          const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
                          if (flagSpan) {
                            flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
                            flagSpan.setAttribute('aria-label', sanitizeHtml(selectedCountry) + ' flag');
                          }

                          const selectedProgram = window.MC?.smsPhoneData?.programs.find(function(program) {
                            return program && program.countryCode === selectedCountry;
                          });

                          var smsNotRequiredRemoveCountryCodeEnabled = true;
                          var smsField = Object.values({"EMAIL":{"name":"EMAIL","label":"Email Address","helper_text":"","merge_id":0,"type":"email","required":true,"audience_field_name":"Email Address","field_type":"merge","enabled":true,"order":null},"FNAME":{"name":"FNAME","label":"First Name","helper_text":"","type":"text","required":false,"audience_field_name":"First Name","enabled":false,"order":null,"field_type":"merge","merge_id":1},"LNAME":{"name":"LNAME","label":"Last Name","helper_text":"","type":"text","required":false,"audience_field_name":"Last Name","enabled":false,"order":null,"field_type":"merge","merge_id":2},"ADDRESS":{"name":"ADDRESS","label":"Address","helper_text":"","type":"address","required":false,"audience_field_name":"Address","enabled":false,"order":null,"field_type":"merge","merge_id":3,"countries":{"2":"Albania","3":"Algeria","4":"Andorra","5":"Angola","6":"Argentina","7":"Armenia","8":"Australia","9":"Austria","10":"Azerbaijan","11":"Bahamas","12":"Bahrain","13":"Bangladesh","14":"Barbados","15":"Belarus","16":"Belgium","17":"Belize","18":"Benin","19":"Bermuda","20":"Bhutan","21":"Bolivia","22":"Bosnia and Herzegovina","23":"Botswana","24":"Brazil","25":"Bulgaria","26":"Burkina Faso","27":"Burundi","28":"Cambodia","29":"Cameroon","30":"Canada","31":"Cape Verde","32":"Cayman Islands","33":"Central African Republic","34":"Chad","35":"Chile","36":"China","37":"Colombia","38":"Congo","40":"Croatia","41":"Cyprus","42":"Czech Republic","43":"Denmark","44":"Djibouti","45":"Ecuador","46":"Egypt","47":"El Salvador","48":"Equatorial Guinea","49":"Eritrea","50":"Estonia","51":"Ethiopia","52":"Fiji","53":"Finland","54":"France","56":"Gabon","57":"Gambia","58":"Georgia","59":"Germany","60":"Ghana","61":"Greece","62":"Guam","63":"Guinea","64":"Guinea-Bissau","65":"Guyana","66":"Honduras","67":"Hong Kong","68":"Hungary","69":"Iceland","70":"India","71":"Indonesia","74":"Ireland","75":"Israel","76":"Italy","78":"Japan","79":"Jordan","80":"Kazakhstan","81":"Kenya","82":"Kuwait","83":"Kyrgyzstan","84":"Lao People's Democratic Republic","85":"Latvia","86":"Lebanon","87":"Lesotho","88":"Liberia","90":"Liechtenstein","91":"Lithuania","92":"Luxembourg","93":"Macedonia","94":"Madagascar","95":"Malawi","96":"Malaysia","97":"Maldives","98":"Mali","99":"Malta","100":"Mauritania","101":"Mexico","102":"Moldova","103":"Monaco","104":"Mongolia","105":"Morocco","106":"Mozambique","107":"Namibia","108":"Nepal","109":"Netherlands","110":"Netherlands Antilles","111":"New Zealand","112":"Nicaragua","113":"Niger","114":"Nigeria","116":"Norway","117":"Oman","118":"Pakistan","119":"Panama","120":"Paraguay","121":"Peru","122":"Philippines","123":"Poland","124":"Portugal","126":"Qatar","127":"Reunion","128":"Romania","129":"Russia","130":"Rwanda","132":"Samoa (Independent)","133":"Saudi Arabia","134":"Senegal","135":"Seychelles","136":"Sierra Leone","137":"Singapore","138":"Slovakia","139":"Slovenia","140":"Somalia","141":"South Africa","142":"South Korea","143":"Spain","144":"Sri Lanka","146":"Suriname","147":"Swaziland","148":"Sweden","149":"Switzerland","152":"Taiwan","153":"Tanzania","154":"Thailand","155":"Togo","156":"Tunisia","157":"Turkiye","158":"Turkmenistan","159":"Uganda","161":"Ukraine","162":"United Arab Emirates","163":"Uruguay","164":"USA","165":"Uzbekistan","166":"Vatican City State (Holy See)","167":"Venezuela","168":"Vietnam","169":"Virgin Islands (British)","170":"Yemen","173":"Zambia","174":"Zimbabwe","175":"Antigua And Barbuda","176":"Anguilla","178":"American Samoa","179":"Aruba","180":"Brunei Darussalam","181":"Bouvet Island","183":"Cook Islands","185":"Christmas Island","187":"Dominican Republic","188":"Western Sahara","189":"Falkland Islands","191":"Faroe Islands","192":"Grenada","193":"French Guiana","194":"Gibraltar","195":"Greenland","196":"Guadeloupe","198":"Guatemala","200":"Haiti","202":"Jamaica","203":"Kiribati","204":"Comoros","205":"Saint Kitts and Nevis","206":"Saint Lucia","207":"Marshall Islands","208":"Macau","210":"Martinique","212":"Mauritius","213":"New Caledonia","214":"Norfolk Island","215":"Nauru","217":"Niue","219":"Papua New Guinea","221":"Pitcairn","222":"Palau","223":"Solomon Islands","225":"Svalbard and Jan Mayen Islands","227":"San Marino","232":"Tonga","233":"Timor-Leste","234":"Trinidad and Tobago","235":"Tuvalu","237":"Saint Vincent and the Grenadines","238":"Virgin Islands (U.S.)","239":"Vanuatu","241":"Mayotte","242":"Myanmar","255":"Sao Tome and Principe","257":"South Georgia and the South Sandwich Islands","260":"Tajikistan","262":"United Kingdom","268":"Costa Rica","270":"Guernsey","272":"North Korea","274":"Afghanistan","275":"Cote D'Ivoire","276":"Cuba","277":"French Polynesia","278":"Iran","279":"Iraq","281":"Libya","282":"Palestine","285":"Syria","286":"Aaland Islands","287":"Turks & Caicos Islands","288":"Jersey  (Channel Islands)","289":"Dominica","290":"Montenegro","293":"Sudan","294":"Montserrat","298":"Curacao","302":"Sint Maarten","311":"South Sudan","315":"Republic of Kosovo","318":"Congo, Democratic Republic of the","323":"Isle of Man","324":"Saint Martin","325":"Bonaire, Saint Eustatius and Saba","326":"Serbia"},"defaultcountry":164},"PHONE":{"name":"PHONE","label":"Phone Number","helper_text":"","type":"phone","required":false,"audience_field_name":"Phone Number","phoneformat":"none","enabled":false,"order":null,"field_type":"merge","merge_id":4},"BIRTHDAY":{"name":"BIRTHDAY","label":"Birthday","helper_text":"","type":"birthday","required":false,"audience_field_name":"Birthday","dateformat":"MM/DD","enabled":false,"order":null,"field_type":"merge","merge_id":5}}).find(function(f) { return f.name === fieldName && f.type === 'smsphone'; });
                          var isRequired = smsField ? smsField.required : false;
                          var shouldAppendCountryCode = smsNotRequiredRemoveCountryCodeEnabled ? isRequired : true;
                          
                          var phoneInput = document.querySelector('#mce-' + fieldName);
                          if (phoneInput && selectedProgram.countryCallingCode && shouldAppendCountryCode) {
                            phoneInput.value = selectedProgram.countryCallingCode;
                          }
                          
                          updateSmsLegalText(selectedCountry, fieldName);
                          updatePlaceholder(selectedCountry, fieldName);
                          updateCountryCodeInstruction(selectedCountry, fieldName);
                        });
                      }

                      document.addEventListener('DOMContentLoaded', function() {
                        const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
                        
                        smsPhoneFields.forEach(function(dropdown) {
                          const fieldName = dropdown?.id.replace('country-select-', '');
                          initializeSmsPhoneDropdown(fieldName);
                        });
                      });
                    }
                    
                    initMailchimp();
                  })();
                `,
              }}
            />
          </div>
        </div>

        <div className="col-4-12_lg">
          <p className="site-footer__copyright">
            &copy; Copyright {new Date().getFullYear()} Inness, LLC
          </p>
        </div>

        <div className="col-2-12_lg">
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
