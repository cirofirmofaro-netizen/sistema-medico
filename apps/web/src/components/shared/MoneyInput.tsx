import React, { forwardRef } from 'react';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, placeholder = "0,00", label, error, className = '', ...props }, ref) => {
    const formatToCurrency = (value: string): string => {
      // Remove tudo exceto números
      const numericValue = value.replace(/\D/g, '');
      
      // Converte para centavos
      const cents = parseInt(numericValue) || 0;
      const reais = cents / 100;
      
      // Formata como moeda brasileira
      return reais.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const parseFromCurrency = (value: string): number => {
      // Remove símbolos de moeda e espaços
      const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Se o campo estiver vazio, limpa o valor
      if (!inputValue.trim()) {
        onChange?.(0);
        return;
      }
      
      // Remove formatação para obter apenas números
      const numericValue = inputValue.replace(/\D/g, '');
      
      // Se não há números, não faz nada
      if (!numericValue) {
        return;
      }
      
      // Converte para centavos e depois para reais
      const cents = parseInt(numericValue);
      const reais = cents / 100;
      
      onChange?.(reais);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue && !inputValue.includes('R$')) {
        // Formata o valor quando o usuário sai do campo
        const numericValue = inputValue.replace(/\D/g, '');
        if (numericValue) {
          const cents = parseInt(numericValue);
          const reais = cents / 100;
          const formattedValue = formatToCurrency(numericValue);
          e.target.value = formattedValue;
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Quando o campo recebe foco, mostra apenas os números
      const inputValue = e.target.value;
      if (inputValue && inputValue.includes('R$')) {
        const numericValue = inputValue.replace(/\D/g, '');
        if (numericValue) {
          const cents = parseInt(numericValue);
          e.target.value = cents.toString();
        }
      }
    };

    // Formata o valor inicial
    const displayValue = value 
      ? formatToCurrency(Math.round(value * 100).toString())
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
