'use client'

import {
  forwardRef,
  useCallback,
  type ComponentPropsWithoutRef,
  type ElementType,
  type Ref,
} from 'react'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'

type AnimationVariant = 'opacity' | 'view'

type AnimateInProps<T extends ElementType = 'div'> = {
  as?: T
  variant?: AnimationVariant
  stage?: 1 | 2
} & ComponentPropsWithoutRef<T>

function AnimateInInner<T extends ElementType = 'div'>(
  {
    as,
    variant = 'opacity',
    stage,
    className,
    children,
    ...props
  }: AnimateInProps<T>,
  forwardedRef: Ref<HTMLElement>
) {
  const Component = (as || 'div') as ElementType
  const { ref, className: animationClassName } = useInViewAnimation({ variant, stage })
  const combinedClassName = [animationClassName, className].filter(Boolean).join(' ')

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      ref.current = node
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [forwardedRef, ref]
  )

  return (
    <Component
      ref={setRef}
      className={combinedClassName || undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

const AnimateIn = forwardRef(AnimateInInner) as <T extends ElementType = 'div'>(
  props: AnimateInProps<T> & { ref?: Ref<HTMLElement> }
) => ReturnType<typeof AnimateInInner>

export default AnimateIn
