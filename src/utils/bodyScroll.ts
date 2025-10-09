/**
 * Utility functions to control body scroll
 * These functions work with the existing CSS scroll control system
 */

export function DisableBodyScroll(): void {
  document.documentElement.classList.remove('scroll-enabled')
}

export function EnableBodyScroll(): void {
  document.documentElement.classList.add('scroll-enabled')
}
