'use client'

import { useEffect, useRef, useState } from 'react'

interface QuantityDropdownProps {
  id: string
  value: number
  onChange: (value: number) => void
  max?: number
}

export default function QuantityDropdown({ id, value, onChange, max = 10 }: QuantityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (newValue: number) => {
    onChange(newValue)
    setIsOpen(false)
  }

  const options = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div className="quantity-dropdown" ref={dropdownRef}>
      <label htmlFor={id}>Qty:</label>
      <div className="quantity-dropdown__wrapper">
        <button
          type="button"
          className="quantity-dropdown__button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Quantity: ${value}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="quantity-dropdown__value">{value}</span>
          <span className="quantity-dropdown__arrow" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M0.326172 0.379623L3.82617 3.37962L7.32617 0.379623"/>
            </svg>
          </span>
        </button>
        {isOpen && (
          <div className="quantity-dropdown__list" role="listbox">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`quantity-dropdown__option ${option === value ? 'quantity-dropdown__option--selected' : ''}`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option === value}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
