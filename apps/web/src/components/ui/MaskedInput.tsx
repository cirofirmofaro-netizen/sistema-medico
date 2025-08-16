import React, { useState, useEffect } from 'react'
import { InputHTMLAttributes } from 'react'

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: 'cpf' | 'phone' | 'currency'
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
}

const masks = {
  cpf: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  },
  phone: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14)
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15)
    }
  },
  currency: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const float = (parseInt(numbers) / 100).toFixed(2)
    return `R$ ${float.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
  }
}

const unmask = {
  cpf: (value: string) => value.replace(/\D/g, ''),
  phone: (value: string) => value.replace(/\D/g, ''),
  currency: (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return (parseInt(numbers) / 100).toFixed(2)
  }
}

export default function MaskedInput({ 
  mask, 
  value, 
  onChange, 
  label, 
  error, 
  className = '',
  ...props 
}: MaskedInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value) {
      setDisplayValue(masks[mask](value))
    } else {
      setDisplayValue('')
    }
  }, [value, mask])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = unmask[mask](e.target.value)
    onChange(rawValue)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={`input ${error ? 'border-red-500' : ''} ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
