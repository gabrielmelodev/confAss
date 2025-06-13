'use client'

import InputMask from 'react-input-mask-next';
import React from 'react'

interface MaskedInputProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  mask: string
  placeholder?: string
  required?: boolean
  error?: boolean
  errorMessage?: string
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  id,
  label,
  value,
  onChange,
  mask,
  placeholder,
  required = false,
  error = false,
  errorMessage,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <InputMask
        id={id}
        mask={mask}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      >
        <input
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          required={required}
        />
      </InputMask>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default MaskedInput
