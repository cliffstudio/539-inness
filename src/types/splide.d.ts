declare module '@splidejs/react-splide' {
  import { ComponentType, Ref, ReactNode } from 'react'

  export interface SplideOptions {
    type?: 'slide' | 'loop' | 'fade'
    rewind?: boolean
    arrows?: boolean
    pagination?: boolean
    lazyLoad?: boolean | 'nearby'
    autoplay?: boolean
    interval?: number
    pauseOnHover?: boolean
    resetProgress?: boolean
    perPage?: number
    perMove?: number
    gap?: string
    breakpoints?: Record<number, Partial<Omit<SplideOptions, 'breakpoints'>>>
  }

  export interface SplideProps {
    options?: SplideOptions
    className?: string
    ref?: Ref<{ go: (direction: string) => void }>
    children?: ReactNode
  }

  export interface SplideSlideProps {
    children?: ReactNode
  }

  export const Splide: ComponentType<SplideProps>
  export const SplideSlide: ComponentType<SplideSlideProps>
}

declare module '@splidejs/splide/css'
declare module '@splidejs/splide/css/core'
declare module '@splidejs/splide/css/sea-green'
declare module '@splidejs/splide/css/skyblue'
declare module '*.css'
