'use client'

interface QuantityDropdownProps {
  id: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function QuantityDropdown({ id, value, onChange, min = 1, max = 10 }: QuantityDropdownProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="quantity-selector__button quantity-selector__button--minus"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" viewBox="0 0 10 2" fill="none">
          <path d="M0 1.248V0H9.384V1.248H0Z"/>
        </svg>
      </button>

      <span className="quantity-selector__value" id={id}>
        {value}
      </span>

      <button
        type="button"
        className="quantity-selector__button quantity-selector__button--plus"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
          <path d="M6.048 4.992H10.752V6.24H6.048V11.256H4.728V6.24H0V4.992H4.728V0H6.048V4.992Z"/>
        </svg>
      </button>
    </div>
  )
}
