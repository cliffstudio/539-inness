/**
 * Namastay booking integration utility
 * 
 * This utility handles initialization and interaction with the Namastay booking widget.
 * The SDK is initialized in the root layout with the hotel parameters.
 */

declare global {
  interface Window {
    initNamastay?: (config: NamastayConfig) => void;
    Namastay?: {
      open?: (offer?: any) => void;
      openWidget?: (offer?: any) => void;
    };
    namastay?: {
      open?: (offer?: any) => void;
      openWidget?: (offer?: any) => void;
    };
  }
}

export interface NamastayConfig {
  apiKey: string;
  spreedlyApiKey: string;
  widgetButtonsClass: string;
  specialOfferButtonsClass: string;
}

export interface NamastayOffer {
  dates?: {
    checkIn: string; // Format: YYYY-MM-DD
    checkOut: string; // Format: YYYY-MM-DD
  };
  rooms?: number;
  guests?: {
    adults: number;
    children?: number;
  };
  promoCode?: string;
  roomId?: string;
}

/**
 * Initialize Namastay SDK with hotel configuration
 * This should be called after the namastay script has loaded
 * Note: This is typically called automatically in the root layout
 */
export function initNamastay(config: NamastayConfig): void {
  if (typeof window === 'undefined' || !window.initNamastay) {
    console.warn('Namastay SDK not loaded yet');
    return;
  }

  try {
    window.initNamastay(config);
  } catch (error) {
    console.error('Error initializing Namastay:', error);
  }
}

/**
 * Get or create a permanent Namastay button that the SDK can detect
 * This button stays in the DOM so the SDK can find it during initialization
 */
function getOrCreateNamastayButton(): HTMLButtonElement {
  let button = document.getElementById('namastay-trigger-button') as HTMLButtonElement;
  
  if (!button) {
    button = document.createElement('button');
    button.id = 'namastay-trigger-button';
    // Use both classes: widget-button for SDK initialization, offer-button for data-offer
    button.className = 'namastay-widget-button namastay-offer-button';
    button.style.position = 'fixed';
    button.style.left = '-9999px';
    button.style.top = '-9999px';
    button.style.opacity = '0';
    button.style.pointerEvents = 'auto';
    button.style.width = '1px';
    button.style.height = '1px';
    button.setAttribute('aria-hidden', 'true');
    document.body.appendChild(button);
  }
  
  return button;
}

/**
 * Open Namastay widget with pre-filled offer data
 * This function uses a permanent button that the SDK can detect during initialization
 * and updates its data-offer attribute before triggering it
 */
export function openNamastayWithOffer(offer: NamastayOffer): void {
  if (typeof window === 'undefined') {
    console.warn('Window object not available');
    return;
  }

  try {
    // Build the data-offer object according to Namastay documentation
    // Documentation: https://docs.namastay.io (see data-offer attribute)
    const offerData: {
      apiKey: string
      startDate?: string
      endDate?: string
      rooms?: number
      adult?: number
      child?: number
      promoCode?: string
      roomId?: string
    } = {
      apiKey: '6e1a1ee72c854f43b9bcb4113572e824nuuwro4cfvmrd62b', // Include API key as per documentation
    };
    
    if (offer.dates) {
      // Use startDate and endDate as per documentation
      offerData.startDate = offer.dates.checkIn;
      offerData.endDate = offer.dates.checkOut;
    }
    
    if (offer.rooms !== undefined) {
      offerData.rooms = offer.rooms;
    }
    
    if (offer.guests) {
      // Use 'adult' (singular) as per documentation
      offerData.adult = offer.guests.adults;
      
      // Only include child if > 0 (also singular as per documentation)
      if (offer.guests.children && offer.guests.children > 0) {
        offerData.child = offer.guests.children;
      }
    }
    
    if (offer.promoCode) {
      offerData.promoCode = offer.promoCode;
    }
    
    if (offer.roomId) {
      offerData.roomId = offer.roomId;
    }

    // First, try to use a direct API method if available
    if (window.Namastay?.open) {
      window.Namastay.open(offerData);
      return;
    }
    if (window.namastay?.open) {
      window.namastay.open(offerData);
      return;
    }
    if (window.Namastay?.openWidget) {
      window.Namastay.openWidget(offerData);
      return;
    }
    if (window.namastay?.openWidget) {
      window.namastay.openWidget(offerData);
      return;
    }

    // Use the permanent button that the SDK should have detected during initialization
    const button = getOrCreateNamastayButton();
    
    // Update the data-offer attribute with the new offer data
    const offerJson = JSON.stringify(offerData);
    
    // Remove old attribute first to ensure clean update
    button.removeAttribute('data-offer');
    
    // Set the new data-offer attribute
    button.setAttribute('data-offer', offerJson);
    
    // Also set as a data property in case the SDK reads it that way
    (button as any).dataset.offer = offerJson;
    
    // Log for debugging
    console.log('Namastay offer data:', offerData);
    console.log('Button data-offer attribute:', button.getAttribute('data-offer'));
    console.log('Button element:', button);
    console.log('Button classes:', button.className);
    
    // Force a reflow to ensure DOM is updated
    void button.offsetHeight;
    
    // Try to trigger the SDK to re-read the attribute by dispatching a custom event
    // Some SDKs listen for attribute changes
    const attributeChangeEvent = new Event('attributechange', { bubbles: true });
    button.dispatchEvent(attributeChangeEvent);
    
    // Also dispatch a mutation event (deprecated but some SDKs still use it)
    if (typeof MutationEvent !== 'undefined') {
      try {
        const mutationEvent = new MutationEvent('DOMAttrModified', {
          bubbles: true,
          cancelable: true,
          attrName: 'data-offer',
          newValue: offerJson,
          prevValue: null
        } as any);
        button.dispatchEvent(mutationEvent);
      } catch (e) {
        // MutationEvent may not be available in all browsers
      }
    }
    
    // Small delay to ensure attribute is processed and SDK has time to read it
    setTimeout(() => {
      // Try multiple methods to trigger the click
      if (button.click) {
        button.click();
      } else {
        // Fallback: dispatch a click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        button.dispatchEvent(clickEvent);
      }
      
      // Also try jQuery if available
      if (typeof window !== 'undefined' && (window as any).jQuery) {
        (window as any).jQuery(button).trigger('click');
      }
    }, 100);
  } catch (error) {
    console.error('Error opening Namastay with offer:', error);
  }
}

/**
 * Format date to YYYY-MM-DD format for Namastay
 */
export function formatDateForNamastay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

